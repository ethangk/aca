function decode(IF){
	this.bufferIF 				= IF;
	this.bufferHold				= new buffer();
	this.bufferEX				= new buffer();
}

decode.prototype.blockTitle = "DE";

decode.prototype.instructionTypes = {	'art': ['add','sub','cmp','div','mul', 'mov', 'hlt'], 'mem': ['ldr', 'str', 'ldrn', 'strn'], 'pcc':['jmp', 'brc', 'nop'],
										'brc': ['blt', 'beq', 'blti', 'bneq']};

decode.prototype.decodeParameter = function(param){
	if(config.debug){
		console.log("Current(DC):", this.currentInstruction, "next(dc):", this.previousInstruction);
	}
	if(this.isRegister(param)){
		//its a register, do a register fetch
		return registerBus.fetch(param);
	}
	else if(!param){
		console.log("Empty param");
	}
	else if(this.isImm(param)){
		return parseInt(param.slice(1), 10);
	}
	else{
		//its a label, do a label fetch
		if(labels[param] === undefined){
			//invalid label
			console.log('INVALID LABEL', param);
		}
		else{
			return labels[param];
		}
	}
};

decode.prototype.isRegister = function(param){
	return (param.charAt(0) === '$');
};

decode.prototype.isLabel = function(param){
	return !(labels[param] === undefined);
}

decode.prototype.isImm = function(param){
	return (param.charAt(0) === '#');
}

decode.prototype.run = function(){


	var unit = true;
	// console.log("BufferIF", this.bufferIF.values);
	for(var bufferCount = 0; bufferCount < this.bufferIF.values.length; bufferCount++)
	// while(unit)
	{

		var instruction = this.bufferIF.values[bufferCount];
		if(!instruction){
			// console.log("Invalid instruction, returning null");
			continue;
		}
		// console.log("Decode instruction", instruction);

		// console.log("Made it trhough to instruction process in decode");
		var storedPC 			= instruction.pc;
			instruction 		= instruction.instruction;
		var opCodeInstructions	= instruction.split(/ (.+)?/);
		var opCode 				= opCodeInstructions[0].toLowerCase();
		var splitInstruction	= opCodeInstructions[1] || '';
			splitInstruction	= splitInstruction.split(',').map(function(i){return i.trim();});
		var decodedInstruction 	= {result: splitInstruction[0], type: ""};

		if(config.debug){
			console.log(splitInstruction);
		}

		if(opCode === 'hlt'){
			// this.bufferIF.pullFromBuffer();
			decodedInstruction.or1 = 1;
			decodedInstruction.or2 = 1;
			decodedInstruction['type'] = 'art';
		}
		else if(this.instructionTypes['art'].indexOf(opCode) > -1){

			//change mov to add 0
			decodedInstruction['type']		= "art";
			decodedInstruction['v1'] 		= this.decodeParameter(splitInstruction[1]);
			decodedInstruction['v2']		= (opCode === 'mov') ? 0 : this.decodeParameter(splitInstruction[2]);

			if(this.isImm(splitInstruction[1]))
				decodedInstruction.or1 = this.decodeParameter(splitInstruction[1]);
			if(opCode!=='mov' && this.isImm(splitInstruction[2]))
				decodedInstruction.or2 = this.decodeParameter(splitInstruction[2]);

			if(opCode === "mov")
			{
				// console.log("MOV", decodedInstruction.v1, decodedInstruction.v2);
				decodedInstruction.or1 = decodedInstruction.v1;
				decodedInstruction.or2 = decodedInstruction.v2;
			}

			opCode = (opCode === 'mov') ? 'add' : opCode;
		}
		else if(this.instructionTypes['mem'].indexOf(opCode) > -1){
			//need to examine this, the offset format might not work correctly
			if(instruction.charAt(instruction.length-1) === ']' && splitInstruction.length === 3){
				//has offset
				splitInstruction[1] = splitInstruction[1].slice(1);
				splitInstruction[2] = splitInstruction[2].slice(0,-1);
				if(opCode.slice(-1) === "n"){
					decodedInstruction['offset']= this.decodeParameter(splitInstruction[2]);
					opCode = opCode.slice(0, -1);
				}
				else
					decodedInstruction['offset'] 	= this.decodeParameter(splitInstruction[2])*config.instructionLength;
			}
			else{
				decodedInstruction['offset'] 	= 0;
			}
			decodedInstruction['memaddr'] 	= this.decodeParameter(splitInstruction[1]);


			//for tomosulu
			decodedInstruction.or2 = splitInstruction[0];
			decodedInstruction.or1 = splitInstruction[1];

			//convert labels to absolute values
			if(this.isLabel(splitInstruction[1]))
				decodedInstruction.or1 = this.decodeParameter(splitInstruction[1]);


			if(opCode === 'str'){

				decodedInstruction['result'] 	= splitInstruction[0];
				
			}
			decodedInstruction['type']			= "lsu";
		}
		else if(this.instructionTypes['pcc'].indexOf(opCode) > -1){
				decodedInstruction['result'] 	= this.decodeParameter(splitInstruction[0]);
				if(opCode.charAt(0) === 'b'){
					//update the LR
					opCode = 'jmp';
					registerBus.push('r30', PCBus.fetch());
				}
				decodedInstruction['type']		= "pcc";
		}
		else if(this.instructionTypes['brc'].indexOf(opCode) > -1){
			//format will be blth r0, r1, r2, where r0 is branch address, r1<r2 with a negoffset

				decodedInstruction['result'] = false;

				decodedInstruction['v1'] 		= this.decodeParameter(splitInstruction[1]);
				if(splitInstruction.length > 2){
					decodedInstruction['v2'] 	= this.decodeParameter(splitInstruction[2]);
				}
				decodedInstruction['type']		= "brc";
		}
		else{

			if(config.debug){
				console.log("Invalid instruction", instruction);
			}


			this.bufferIF.pullFromBuffer();
			continue;
		}


		decodedInstruction.opCode = opCode;
		decodedInstruction.original = instruction;
		if(!decodedInstruction.or1 && decodedInstruction.or1 !== 0)
			decodedInstruction.or1  = (splitInstruction[1] !== undefined && this.isRegister(splitInstruction[1])) ? splitInstruction[1].slice(1) : null;
		if(!decodedInstruction.or2 && decodedInstruction.or2 !== 0)
			decodedInstruction.or2  = (splitInstruction[2] !== undefined && this.isRegister(splitInstruction[2])) ? splitInstruction[2].slice(1) : null;


		//this can be optimised, if we have a move and a free arth unit, and a ldr is holding everything up, then the move should execute
		var unit = reservationStations.findAvailableUnit(decodedInstruction.type);
		// console.log("UNIT", decodedInstruction, unit);
		// console.log("Looking for unit",decodedInstruction.type);
		if(!unit)
			continue;
		// this.bufferIF.pullFromBuffer();
		this.bufferIF.values.splice(bufferCount, 1);
		bufferCount--;
		//its just going to set it to the same value, but it'll shift the value off
		// decodedInstruction = this.bufferDE.pullFromBuffer();

		if(config.debug)
			console.log(decodedInstruction);

		var b = reorderBuffer.push(decodedInstruction, storedPC);

		var unitEntryConfig = {Vj:0, Vk: 0, Qk: 0, Qj: 0, dest: b, A:0};
		var statusOR1 = null;
		var statusOR2 = null;
		//issue
		if(typeof decodedInstruction.or1 === "number" ||  !!decodedInstruction.or1)
		{
			// if(decodedInstruction.opCode === "add" && decodedInstruction.result === "$r0")
			// console.log("Valid instruction");
			if(typeof decodedInstruction.or1 === "number"){
				unitEntryConfig.Vj = decodedInstruction.or1;
				unitEntryConfig.Qj = 0;
			}
			else{
				statusOR1 = registerBus.getStatus(decodedInstruction.or1);

				// if(decodedInstruction.opCode === "add" && decodedInstruction.result === "$r0"){
				// 	console.log("OR1 STATUS",statusOR1, statusOR1.busy, decodedInstruction.or1, decodedInstruction);
				// }
				if(statusOR1.busy){
					var h = statusOR1.reorder;
					//. console.log("ROB", "OR1", h);


					if(reorderBuffer.getItem(h).ready){
						//instruction already completed
						//. console.log("ROB","OR1",h,"READY");
						unitEntryConfig.Vj = reorderBuffer.getItem(h).value;
						unitEntryConfig.Qj = 0;

					}
					else{
						//. console.log("ROB","OR1",h,"NOT READY");
						unitEntryConfig.Qj = h;
						//wait for instruction
					}


				}
				else{
					//. console.log("ROB","OR1","NOT NEEDED");
					unitEntryConfig.Vj = registerBus.fetch(decodedInstruction.or1);
					unitEntryConfig.Qj = 0;
				}
			}


			unitEntryConfig.dest = b;
		}

		if(typeof decodedInstruction.or2 === "number" || !!decodedInstruction.or2){
			if(decodedInstruction.type === "art" || decodedInstruction.opCode === "str" || decodedInstruction.type === "brc"){
				if(typeof decodedInstruction.or2 === "number"){
					unitEntryConfig.Vk = decodedInstruction.or2;
					unitEntryConfig.Qk = 0;
				}
				else{
					statusOR2 = registerBus.getStatus(decodedInstruction.or2);
					if(statusOR2.busy){
						var h = statusOR2.reorder;
						if(reorderBuffer.getItem(h).ready){
							unitEntryConfig.Vk = reorderBuffer.getItem(h).value;
							unitEntryConfig.Qk = 0;
						}
						else{
							//tell it to set its wait target to reorder buffer h
							unitEntryConfig.Qk = h;
						}
					}
					else{
						unitEntryConfig.Vk = registerBus.fetch(decodedInstruction.or2);
						unitEntryConfig.Qk = 0;
					}
				}
			}
		}


		if(decodedInstruction.type === "art" && decodedInstruction.opCode !== "hlt"){
			registerBus.pushStatus(decodedInstruction.result, true, b);
		}

		if(decodedInstruction.opCode === "ldr"){
			unitEntryConfig.A = decodedInstruction.offset;
			registerBus.pushStatus(decodedInstruction.or2, true, b);
			reorderBuffer.setDest(b, decodedInstruction.or2);
		}

		if(decodedInstruction.opCode === "str"){
			unitEntryConfig.A = decodedInstruction.offset;
			if(reorderBuffer.latestStore === 0)
				reorderBuffer.latestStore = b;
		}

		if(typeof unitEntryConfig.Vj === "boolean"){
			var rb1 = (statusOR1 === null)? "none" : reorderBuffer.getItem(statusOR1.reorder).ready;
			var rb2 = (statusOR2 === null)? "none" : reorderBuffer.getItem(statusOR2.reorder).ready;
			// var rbv1 = (statusOR1 === null)? "none" : reorderBuffer.getItem(statusOR1.reorder).ready;
			console.log("BOOL VJ", unitEntryConfig, decodedInstruction, statusOR1, statusOR2, rb1, rb2);
			throw false;
		}



		// if(b === 24){
		// 	console.log("ROB24", unitEntryConfig, decodedInstruction);
		// 	// throw "rob24";
		// }

		unit.placeInstruction(decodedInstruction, unitEntryConfig, b);	

		// console.log("decode", decodedInstruction);
		// this.bufferEX.placeInBuffer(decodedInstruction);
	}
	return;
}
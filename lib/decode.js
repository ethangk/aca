function decode(IF){
	this.bufferIF 				= IF;
	this.bufferHold				= new buffer();
	this.bufferEX				= new buffer();
}

decode.prototype.blockTitle = "DE";

decode.prototype.instructionTypes = {	'art': ['add','sub','cmp','div','mul', 'mov'], 'mem': ['ldr', 'str'], 'pcc':['jmp', 'brc', 'hlt', 'nop'],
										'bool': ['blt', 'beq', 'blti', 'beqi']};

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
	else if(param.charAt(0) === '#'){
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



decode.prototype.run = function(){


	var unit = true;
	// console.log("BufferIF", this.bufferIF.values);
	while(unit)
	{

		var instruction = this.bufferIF.peek();
		if(!instruction){
			// console.log("Invalid instruction, returning null");
			break;
		}
		console.log("Decode instruction", instruction);

		// console.log("Made it trhough to instruction process in decode");
		var opCodeInstructions	= instruction.split(/ (.+)?/);
		var opCode 				= opCodeInstructions[0].toLowerCase();
		var splitInstruction	= opCodeInstructions[1] || '';
			splitInstruction	= splitInstruction.split(',').map(function(i){return i.trim();});
		var decodedInstruction 	= {result: splitInstruction[0], type: ""};

		if(config.debug){
			console.log(splitInstruction);
		}

		if(this.instructionTypes['art'].indexOf(opCode) > -1){

			//change mov to add 0
			decodedInstruction['type']		= "art";
			decodedInstruction['v1'] 		= this.decodeParameter(splitInstruction[1]);
			decodedInstruction['v2']		= (opCode === 'mov') ? 0 : this.decodeParameter(splitInstruction[2]);

			if(opCode === "mov")
			{
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
				decodedInstruction['offset'] 	= this.decodeParameter(splitInstruction[2])*config.instructionLength;
			}
			else{
				decodedInstruction['offset'] 	= 0;
			}
			decodedInstruction['memaddr'] 	= this.decodeParameter(splitInstruction[1]);


			//for tomosulu
			decodedInstruction.or2 = splitInstruction[0];
			decodedInstruction.or1 = splitInstruction[1];


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
		else if(this.instructionTypes['bool'].indexOf(opCode) > -1){
			//format will be blth r0, r1, r2, where r0 is branch address, r1<r2 with a negoffset
				if(opCode.slice(-1) == 'i'){
					decodedInstruction['result'] = PCBus.fetch()+(parseInt(splitInstruction[0], 10)*config.instructionLength);
					opCode = opCode.slice(0,-1);
				}
				else{
					decodedInstruction['result'] = this.decodeParameter(splitInstruction[0]);
				}
				decodedInstruction['v1'] 		= this.decodeParameter(splitInstruction[1]);
				if(splitInstruction.length > 2){
					decodedInstruction['v2'] 	= this.decodeParameter(splitInstruction[2]);
				}
				decodedInstruction['type']		= "bool";
		}
		else{
			console.log("Invalid instruction");
		}


		decodedInstruction.opCode = opCode;
		decodedInstruction.original = instruction;
		if(!decodedInstruction.or1 && decodedInstruction.or1 !== 0)
			decodedInstruction.or1  = (splitInstruction[1] !== undefined && this.isRegister(splitInstruction[1])) ? splitInstruction[1].slice(1) : null;
		if(!decodedInstruction.or2 && decodedInstruction.or2 !== 0)
			decodedInstruction.or2  = (splitInstruction[2] !== undefined && this.isRegister(splitInstruction[2])) ? splitInstruction[2].slice(1) : null;


		//this can be optimised, if we have a move and a free arth unit, and a ldr is holding everything up, then the move should execute
		var unit = reservationStations.findAvailableUnit(decodedInstruction.type);
		console.log("UNIT", decodedInstruction, unit);
		// console.log("Looking for unit",decodedInstruction.type);
		if(!unit)
			break;
		this.bufferIF.pullFromBuffer();
		//its just going to set it to the same value, but it'll shift the value off
		// decodedInstruction = this.bufferDE.pullFromBuffer();

		if(config.debug)
			console.log(decodedInstruction);

		var b = reorderBuffer.push(decodedInstruction);
		// var unitEntryConfig = {Vj:0, Vk: 0, Qk: 0, Qj: 0, dest: b, A:0};
	
		unit.placeInstruction(decodedInstruction, b);	
		//issue
		if(typeof decodedInstruction.or1 === "number" ||  !!decodedInstruction.or1)
		{
			// console.log("Valid instruction");
			if(typeof decodedInstruction.or1 === "number"){
				unit.Vj = decodedInstruction.or1;
				unit.Qj = 0;
			}
			else{
				var statusOR1 = registerBus.getStatus(decodedInstruction.or1);
				if(statusOR1.busy){
					var h = statusOR1.reorder;
					//. console.log("ROB", "OR1", h);

					if(reorderBuffer.getItem(h).ready){
						//instruction already completed
						//. console.log("ROB","OR1",h,"READY");
						unit.Vj = reorderBuffer.getItem(h).value;
						unit.Qj = 0;
					}
					else{
						//. console.log("ROB","OR1",h,"NOT READY");
						unit.Qj = h;
						//wait for instruction
					}
				}
				else{
					//. console.log("ROB","OR1","NOT NEEDED");
					unit.Vj = registerBus.fetch(decodedInstruction.or1);
					unit.Qj = 0;
				}
			}


			unit.dest = b;
		}

		if(typeof decodedInstruction.or2 === "number" || !!decodedInstruction.or2){
			if(decodedInstruction.type === "art" || decodedInstruction.opCode === "str"){
				if(typeof decodedInstruction.or2 === "number"){
					unit.Vk = decodedInstruction.or2;
					unit.Qk = 0;
				}
				else{
					var statusOR2 = registerBus.getStatus(decodedInstruction.or2);
					if(statusOR2.busy){
						var h = statusOR2.reorder;
						if(reorderBuffer.getItem(h).ready){
							unit.Vk = reorderBuffer.getItem(h).value;
							unit.Qk = 0;
						}
						else{
							//tell it to set its wait target to reorder buffer h
							unit.Qk = h;
						}
					}
					else{
						unit.Vk = registerBus.fetch(decodedInstruction.or2);
						unit.Qk = 0;
					}
				}
			}
		}


		if(decodedInstruction.type === "art"){
			registerBus.pushStatus(decodedInstruction.result, true, b);
		}

		if(decodedInstruction.opCode === "ldr"){
			unit.A = decodedInstruction.offset;
			registerBus.pushStatus(decodedInstruction.or2, true, b);
			reorderBuffer.setDest(b, decodedInstruction.or2);
		}

		if(decodedInstruction.opCode === "str"){
			unit.A = decodedInstruction.offset;
			if(reorderBuffer.latestStore === 0)
				reorderBuffer.latestStore = b;
		}



		// console.log("decode", decodedInstruction);
		// this.bufferEX.placeInBuffer(decodedInstruction);
	}
	return;
}
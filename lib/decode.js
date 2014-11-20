function decode(){
	return {

	instructionTypes: {	'art': ['add','sub','cmp','div','mul'], 'ope': ['mov'], 'mem': ['ldr', 'str'], 'pcc':['jmp', 'brc', 'hlt'],
						'bool': ['blt', 'beq', 'blti', 'beqi']},
	decodeParameter: function(param){
			if(param.charAt(0) === '$'){
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
		},
	run: function(instruction){
			if(instruction === false){
				return;
			}
			var opCodeInstructions	= instruction.split(/ (.+)?/);
			var opCode 				= opCodeInstructions[0].toLowerCase();
			var splitInstruction	= opCodeInstructions[1] || '';
				splitInstruction	= splitInstruction.split(',').map(function(i){return i.trim();});
			var decodedInstruction 	= {result: splitInstruction[0]};

			if(config.debug){
				console.log(splitInstruction);
			}

			if(this.instructionTypes['art'].indexOf(opCode) > -1){
					decodedInstruction['v1'] 		= this.decodeParameter(splitInstruction[1]);
						decodedInstruction['v2'] 	= this.decodeParameter(splitInstruction[2]);
			}
			else if(this.instructionTypes['ope'].indexOf(opCode) > -1){
					decodedInstruction['imm']  		= this.decodeParameter(splitInstruction[1]);
			}
			else if(this.instructionTypes['mem'].indexOf(opCode) > -1){
				//need to examine this, the offset format might not work correctly
				if(instruction.charAt(instruction.length-1) === ']'){
					//has offset
					decodedInstruction['offset'] 	= this.decodeParameter(splitInstruction[2].slice(0,-1))*config.instructionLength;
					decodedInstruction['memaddr']	= this.decodeParameter(splitInstruction[1].slice(1));
				}
				else{
					decodedInstruction['offset'] 	= 0;
					decodedInstruction['memaddr'] 	= this.decodeParameter(splitInstruction[1]);
				}
				if(opCode === 'str'){
					decodedInstruction['result'] 	= this.decodeParameter(splitInstruction[0]);
				}
			}
			else if(this.instructionTypes['pcc'].indexOf(opCode) > -1){
					decodedInstruction['result'] 	= this.decodeParameter(splitInstruction[0]);
					if(opCode.charAt(0) === 'b'){
						//update the LR
						opCode = 'jmp';
						registerBus.push('r30', PCBus.fetch());
					}
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
			}
			else{
				console.log("Invalid instruction");
			}


			decodedInstruction.opCode = opCode;
			return decodedInstruction;	
		}
	};
}
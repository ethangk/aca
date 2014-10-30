function execute(){


	return {
		run : function(decodedInstruction){
			if(config.debug)
				console.log(decodedInstruction);
			var outValue = 0;
			var outObject = {opCode: decodedInstruction.opCode, outValue: 0, finalReg: decodedInstruction.result};
			switch(decodedInstruction.opCode){
					case 'add':
						outObject.outValue = decodedInstruction.v1 + decodedInstruction.v2;
					break;
					case 'sub':
						outObject.outValue = decodedInstruction.v1 - decodedInstruction.v2;
					break;
					case 'mul':
						outObject.outValue = decodedInstruction.v1 * decodedInstruction.v2;
					break;
					case 'div':
						outObject.outValue = decodedInstruction.v1 / decodedInstruction.v2;
					break;
					case 'mov':
						outObject.outValue = decodedInstruction.imm;
					break;
					case 'cmp':
						if(decodedInstruction.v1 > decodedInstruction.v2){
							outObject.outValue = 1;
						}
						else if(decodedInstruction.v1 < decodedInstruction.v2){
							outObject.outValue = -1;
						}
						else{
							outObject.outValue = 0;
						}
					break;
					case 'blt':
						if(decodedInstruction.v1 < decodedInstruction.v2){
							outObject.outValue = 1;
						}
					break;
					case 'beq':
						if(decodedInstruction.v1 == decodedInstruction.v2){
							outObject.outValue = 1;
						}
						//change to blt to decrease complexity in the writeback stage
						outObject.opCode = 'blt';
					break;
					case 'bgtz':
						if(decodedInstruction.v1 > 0){
							outObject.outValue = 1;
						}
						outObject.opCode = 'blt';
					break;
					case 'ldr':
						outObject.outValue = decodedInstruction.memaddr + decodedInstruction.offset;
					break;
					case 'str':
						outObject.outValue = decodedInstruction.memaddr + decodedInstruction.offset;
					break;

				}

			return outObject;
		}
	};
}
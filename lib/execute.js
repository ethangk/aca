function execute(){
	return {
		blockTitle = "EX",
		previousInstruction: null,
		currentInstruction: null,
		writeBack: [{reg: -1, value: -1}, {reg: -1, value: -1}],
		deliverDataWhenReady: function(){
			
		},
		run : function(decodedInstruction){
			if(config.debug)
				console.log(decodedInstruction);
			if(!decodedInstruction)
				return null;
			var outValue = 0;
			//do the switcharoo
			var outObject = {opCode: decodedInstruction.opCode, outValue: 0, finalReg: decodedInstruction.result, original: decodedInstruction.original, address: decodedInstruction.address};
			if(decodedInstruction.or1 === this.writeBack[0].reg){
				decodedInstruction.v1 = registerBus.fetch(decodedInstruction.or1);
				console.log("TRANSFER AT or1 wb0");
			}
			else if(decodedInstruction.or1 === this.writeBack[1].reg){
				decodedInstruction.v1 = registerBus.fetch(decodedInstruction.or1);
				console.log("TRANSFER AT or1 wb1");
			}
			else if(decodedInstruction.or2 === this.writeBack[0].reg){
				decodedInstruction.v2 = registerBus.fetch(decodedInstruction.or2);
				console.log("TRANSFER AT or2 wb0");
			}
			else if(decodedInstruction.or2 === this.writeBack[1].reg){
				decodedInstruction.v2 = registerBus.fetch(decodedInstruction.or2);
				console.log("TRANSFER AT or2 wb1");
			}

			console.log("or1",decodedInstruction.or1,"wb0",this.writeBack[0].reg,"or2",decodedInstruction.or2,"wb1",this.writeBack[1].reg, decodedInstruction.original);
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
				var backChannelObject = {};
				if(typeof(outObject.finalReg) === "string"){
					backChannelObject = {reg: outObject.finalReg.slice(1), value: outObject.outValue};
				}
				else{
					backChannelObject = {reg: -1, value: -1};
				}
			this.writeBack.push(backChannelObject);
			if(this.writeBack.length > 2)
				this.writeBack.shift();
			this.previousInstruction = this.currentInstruction;
			this.currentInstruction = outObject;
			return;
		}
	};
}
function branchBlock(){
	return{
		returnValue: null,
		cycleCount: 0,
		cycleLimit: 1,
		returnWhenReady: function(){
			if(this.returnValue === null)
				return null;
			var v = this.returnValue;
			this.cycleCount = 0;
			this.returnValue = null;
			return v;
		},
		run: function(decodedInstruction){
			if(config.debug)
				console.log(decodedInstruction);
			if(!decodedInstruction)
				return null;
			this.cycleCount++;
			if(this.cycleCount<this.cycleLimit)
				return;
			switch(decodedInstruction.opCode){
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
			}
			return;
		}
	};
}
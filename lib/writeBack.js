function writeBack(){
	return {
		blockTitle: "WB",
		currentInstruction: null,
		previousInstruction: null,
		run: function(item){
			if(!item)
				return null;
			this.previousInstruction = this.currentInstruction;
			this.currentInstruction = item;
			switch(item.opCode){
				case 'hlt':
					return false;
				break;
				case 'str':

				break;
				case 'jmp':
					if(config.debug){
						console.log(item.finalReg);
					}
					PCBus.push(item.finalReg);
				break;
				case 'blt':
					if(item.outValue === 1){
						PCBus.push(item.finalReg);
					}
				break;
				case 'nop':
					//do nothing
				break;
				default:
					registerBus.push(item.finalReg, item.outValue);
				break;
			}

			return true;

		}
	};
}
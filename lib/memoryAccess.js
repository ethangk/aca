function memoryAccess(){
	return{
		blockTitle: "MA",
		currentInstruction: null,
		previousInstruction: null,
		run: function(item){
			if(!item)
				return null;
			this.previousInstruction = this.currentInstruction;
			this.currentInstruction = item;
			if(item.opCode === 'ldr'){
				item.outValue = memoryBus.fetch(item.outValue);
			}
			else if(item.opCode === 'str'){
				memoryBus.push(item.outValue, item.finalReg);
			}
			return;
		}
	}
}
function memoryAccess(){
	return{
		run: function(item){
			if(item.opCode === 'ldr'){
				item.outValue = memoryBus.fetch(item.outValue);
			}
			else if(item.opCode === 'str'){
				memoryBus.push(item.outValue, item.finalReg);
			}
			return item;
		}
	}
}
function writeBack(){
	return {
		run: function(item){
			

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
				default:
					registerBus.push(item.finalReg, item.outValue);
				break;
			}

			return true;

		}
	};
}
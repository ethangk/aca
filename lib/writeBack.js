function writeBack(MA){
	this.bufferMEM = MA;
}

writeBack.prototype.blockTitle = "WB";

writeBack.prototype.run = function(){
	if(!item)
		return null;
	for(var i = 0; i<2; i++)
	{
		var item = this.bufferMEM.pullFromBuffer();
		if(!item)
			return;
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
	}
	return true;

}
function memoryAccess(EX){
	this.bufferHold = new buffer();
	this.bufferWB 	= new buffer();
	this.bufferEX 	= EX;
}
memoryAccess.prototype.blockTitle = "MA";

memoryAccess.prototype.run = function(){
	
	this.bufferWB.fillFromBuffer(this.bufferHold);
	for(var i = 0; i<2; i++)
	{
		var item = this.bufferEX.pullFromBuffer();
		if(!item)
			return;
		if(item.opCode === 'ldr'){
			item.outValue = memoryBus.fetch(item.outValue);
		}
		else if(item.opCode === 'str'){
			memoryBus.push(item.outValue, item.finalReg);
		}
		this.bufferHold.placeInBuffer(item);
	}
	return;
};
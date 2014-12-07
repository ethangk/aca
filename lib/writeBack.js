function writeBack(MA){
	this.bufferMEM = MA;
	//purely for tracing purposes
	this.bufferHold  = new buffer();
}

writeBack.prototype.blockTitle = "WB";

writeBack.prototype.run = function(){
	for(var i = 0; i<2; i++)
	{
		var item = this.bufferMEM.pullFromBuffer();
		reorderBuffer.commit("wb");
		if(!item)
			return;
		// switch(item.opCode){
		// 	case 'hlt':
		// 		return false;
		// 	break;
		// 	case 'str':

		// 	break;
		// 	case 'jmp':
		// 		if(config.debug){
		// 			console.log(item.finalReg);
		// 		}
		// 		PCBus.push(item.finalReg);
		// 	break;
		// 	case 'blt':
		// 		if(item.outValue === 1){
		// 			PCBus.push(item.finalReg);
		// 		}
		// 	break;
		// 	case 'nop':
		// 		//do nothing
		// 	break;
		// 	default:
		// 		registerBus.push(item.result, item.returnValue);
		// 	break;
		// }
		this.bufferHold.placeInBuffer(item);
	}
	return true;

}
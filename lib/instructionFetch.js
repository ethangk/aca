function instructionFetch(){
	this.bufferHold = new buffer();
	this.bufferDE = new buffer();	
}

instructionFetch.prototype.blockTitle= "IF";

instructionFetch.prototype.bufferEmpty = function(){
	return (this.bufferDE.values.length === 0);
};

instructionFetch.prototype.run = function(){

	if(!this.bufferDE.isEmpty())
		return;

	for(var i = 0; i<config.issueWidth; i++)
		this.bufferDE.placeInBuffer(instructionBus.fetchPC());
	// this.bufferDE.placeInBuffer(instructionBus.fetchPC());

	// console.log("IF",this.bufferDE.values);

	if(config.debug)
	{
		console.log("bufferHold",this.bufferHold.values);
		console.log("buffer",this.bufferDE.values);
	}
	return;
};
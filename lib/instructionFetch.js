function instructionFetch(){
	this.bufferHold = new buffer();
	this.bufferDE = new buffer();
}

instructionFetch.prototype.initDecodeLink = function(DE){
	this.DE = DE;
}


instructionFetch.prototype.bufferEmpty = function(){
	return (this.bufferDE.values.length === 0);
};

instructionFetch.prototype.run = function(){

	if(!this.bufferDE.isEmpty())
		return;


	for(var i = 0; i<config.issueWidth; i++){
		var instruction = instructionBus.fetchPC();
		if(!instruction)
			continue;
		if(instruction.charAt(0) === "b" || instruction.charAt(0) === "j"){
			//its a branch, update pc
			//horrible repeat of code
			var opCodeInstructions	= instruction.split(/ (.+)?/);
			var opCode 				= opCodeInstructions[0].toLowerCase();
			var splitInstruction	= opCodeInstructions[1] || '';
				splitInstruction	= splitInstruction.split(',').map(function(i){return i.trim();});

			registerBus.push('r30', PCBus.fetch());
			PCBus.push(this.DE.decodeParameter(splitInstruction[0]));
			if(instruction.charAt(0) === 'j'){
				//its a jump, no need to put that through any busse
				i--;
				continue;
			}
		}
		this.bufferDE.placeInBuffer(instruction);
	}
	// this.bufferDE.placeInBuffer(instructionBus.fetchPC());

	// console.log("IF",this.bufferDE.values);

	if(config.debug)
	{
		console.log("bufferHold",this.bufferHold.values);
		console.log("buffer",this.bufferDE.values);
	}
	return;
};
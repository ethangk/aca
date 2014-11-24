function instructionFetch(){
	return {
	blockTitle: "IF",
	currentInstruction: null,
	previousInstruction: null,

	run : function(){
			this.previousInstruction = this.currentInstruction;
			this.currentInstruction = instructionBus.fetchPC();
			return;
		}
	};
}
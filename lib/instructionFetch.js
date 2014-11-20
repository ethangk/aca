function instructionFetch(){
	return {
	run : function(){
			return instructionBus.fetchPC();
		}
	};
}
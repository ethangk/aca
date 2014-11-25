function exControl(){
	for(var i = 0; i<arguments.length; i++){
		if(!(typeof(arguments[i]) === "object" && arguments[i].blockName !== undefined && arguments[i].blockName === "EX")){
			console.log("Item passed in isn't an execution unit");
			return false;
		}
	}
	return{
		//items passed in will be stored in the arguments array
		exUnits: arguments,
		instructionList: [],
		consumeReadyInstructions: function(decodeBlock){
			var blockOffer = decodeBlock.deliverWhenReady();
			if(!blockOffer)
				return;
			instructionList.push(blockOffer);
		},
		distributeWork: function(){
			for(var i = 0; i<exUnits.length; i++){
				if(instructionList.length != 0){
					var instruction = instructionList.shift();
					
				}
			}
		}
	};
}
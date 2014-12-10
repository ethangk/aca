function instructionFetch(){
	this.bufferHold = new buffer();
	this.bufferDE = new buffer();
}

instructionFetch.prototype.initDecodeLink = function(DE){
	this.DE = DE;
}

instructionFetch.prototype.clearBuffer = function(){
	this.bufferDE.empty();
}

instructionFetch.prototype.bufferEmpty = function(){
	return (this.bufferDE.values.length === 0);
};

instructionFetch.prototype.run = function(){


	if(this.bufferDE.values.length === config.issueWidth){

		if(config.debug){
			console.log("not empty, stalling", this.bufferDE.values);
		}

		
		//actually at the end
		if(this.bufferDE.values.length === 1 && this.bufferDE.values[0] === "hlt"){
			if(PCBus.fetch() === labels['end']+config.instructionLength){
				//actual end of program
				console.log("Program ended");
				// fetchFinished = true;
				return;
			}
			else{
				//not the end, dont quit now, clear the buffer. this is cuased by mispredicted branch
				this.bufferDE.values = [];
			}
		}
		else
			return;
	}

	if(config.debug){
		console.log("FETCHING");
	}



	for(var i = this.bufferDE.values.length; i<config.issueWidth; i++){
		var instruction = instructionBus.fetchPC();
		var storedPC = -1;
		if(PCBus.fetch() > labels['end'] && reorderBuffer.getPointer()-reorderBuffer.valuesLength === 0){
			finished = true;
		}

		if(!instruction)
			break;
		if(instruction.charAt(0) === "b" || instruction.charAt(0) === "j"){

			// //stall if length is 2
			// if(registerBus.registerStates.length === 1){
			// 	console.log("STALLING");
			// 	return;
			// }

			//its a branch, update pc
			//horrible repeat of code
			var opCodeInstructions	= instruction.split(/ (.+)?/);
			var opCode 				= opCodeInstructions[0].toLowerCase();
			var splitInstruction	= opCodeInstructions[1] || '';
				splitInstruction	= splitInstruction.split(',').map(function(i){return i.trim();});

			var storedPC = PCBus.fetch();
			if(config.debug){
				console.log("FOUND BRANCH", instruction, opCodeInstructions);
			}


			PCBus.push(this.DE.decodeParameter(splitInstruction[0]));
			if(instruction.opCode === "brc")
				registerBus.push('r30', storedPC);
			if(opCode === 'jmp' || opCode === "brc"){
				//its a jump, no need to put that through any busse
				if(config.debug){
					console.log("PULLING",instruction,"from the queue");
				}


				i--;
				continue;
			}
			else{

				if(config.debug){
					console.log("PC","BACKUP", storedPC);
				}
				// registerBus.backupState(storedPC);
			}
		}
		this.bufferDE.placeInBuffer({instruction:instruction,pc:storedPC});
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
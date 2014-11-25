function arithBlock(){
	this.cycleCount = 0;
	this.cycleLimit = 1;
	this.completedInstruction = null;
	this.busy = false;
	this.instructionBeingWorkedOn = null;
	this.completedButNotFetched = false;
	this.returnValue;
}

arithBlock.prototype.exType = "art";

arithBlock.prototype.fetchCompletedInstruction = function(){
	if(!this.busy && this.completedInstruction !== null){
		var returnValue = this.completedInstruction;
		this.completedInstruction = null;
		this.cycleCount = 0;
		return returnValue;
	}
	return null;
}

arithBlock.prototype.readyToRun = function(decodedInstruction){
	console.log("Ready to run?", decodedInstruction);
	//if theres a completed instruction in waiting, leave
	if(!!this.completedInstruction)
		return false;
	if(!decodedInstruction && !this.instructionBeingWorkedOn)
		return false;
	this.busy = true;

	//if we're partially through an instruction, just set the value to itself
	this.instructionBeingWorkedOn = (!decodedInstruction)? this.instructionBeingWorkedOn : decodedInstruction;
	this.cycleCount++;
	if(this.cycleCount<this.cycleLimit)
		return false;
	return true;
}

arithBlock.prototype.completeExecution = function(){
	this.busy = false;
	this.instructionBeingWorkedOn = null;
	this.completedInstruction = this.returnValue;
}

arithBlock.prototype.run = function(decodedInstruction){
			if(config.debug)
				console.log(decodedInstruction);

			if(!this.readyToRun(decodedInstruction))
				return;

			console.log("Running on a unit", this.instructionBeingWorkedOn);

			switch(this.instructionBeingWorkedOn.opCode){
				case 'add':
					this.returnValue = decodedInstruction.v1 + decodedInstruction.v2;
				break;
				case 'sub':
					this.returnValue = decodedInstruction.v1 - decodedInstruction.v2;
				break;
				case 'mul':
					this.returnValue = decodedInstruction.v1 * decodedInstruction.v2;
				break;
				case 'div':
					this.returnValue = decodedInstruction.v1 / decodedInstruction.v2;
				break;
			}

			this.completeExecution();
			return;
		}
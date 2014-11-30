function arithBlock(id){
	this.cycleCount = 0;
	this.cycleLimit = 1;
	this.id = id;
	this.completedInstruction = null;
	this.busy = false;
	this.instructionBeingWorkedOn = null;
	this.completedButNotFetched = false;
	this.returnValue;
}

arithBlock.prototype.exType = "art";

arithBlock.prototype.fetchCompletedInstruction = function(){

	if(!this.busy && this.completedInstruction !== null){
		console.log(this.id,"giving up",this.completedInstruction);
		var returnValue = this.completedInstruction;
		this.completedInstruction = null;
		this.cycleCount = 0;
		return returnValue;
	}
	return null;
}

arithBlock.prototype.readyToRun = function(){
	//if theres a completed instruction in waiting or theres nothing to be worked on, leave
	if(!!this.completedInstruction || !this.instructionBeingWorkedOn)
		return false;


	//if we're partially through an instruction, just set the value to itself
	// this.instructionBeingWorkedOn = (!decodedInstruction)? this.instructionBeingWorkedOn : decodedInstruction;
	this.cycleCount++;
	if(this.cycleCount<this.cycleLimit)
		return false;
	return true;
}

arithBlock.prototype.completeExecution = function(){
	this.busy = false;
	this.completedInstruction = this.instructionBeingWorkedOn;
	this.instructionBeingWorkedOn = null;
}

arithBlock.prototype.fillInstruction = function(decodedInstruction){
	if(!this.instructionBeingWorkedOn && !this.completedInstruction)
	{
		console.log("filling",this.id,"with",decodedInstruction);
		this.busy = true;
		this.instructionBeingWorkedOn = decodedInstruction;
	}
}

arithBlock.prototype.run = function(){
			if(config.debug)
				console.log();

			if(!this.readyToRun())
				return;


			switch(this.instructionBeingWorkedOn.opCode){
				case 'add':
					this.instructionBeingWorkedOn.returnValue = this.instructionBeingWorkedOn.v1 + this.instructionBeingWorkedOn.v2;
				break;
				case 'sub':
					this.instructionBeingWorkedOn.returnValue = this.instructionBeingWorkedOn.v1 - this.instructionBeingWorkedOn.v2;
				break;
				case 'mul':
					this.instructionBeingWorkedOn.returnValue = this.instructionBeingWorkedOn.v1 * this.instructionBeingWorkedOn.v2;
				break;
				case 'div':
					this.instructionBeingWorkedOn.returnValue = this.instructionBeingWorkedOn.v1 / this.instructionBeingWorkedOn.v2;
				break;
			}

			this.completeExecution();
			return;
		}
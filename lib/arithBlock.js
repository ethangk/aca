function unit(exType){
	this.cycleCount = 0;
	this.cycleLimit = 1;
	this.id = unit.prototype.idCount++;
	this.ROBId = 0;
	this.completedInstruction = null;
	this.busy = false;
	this.instructionBeingWorkedOn = null;
	this.completedButNotFetched = false;
	this.returnValue;
	this.exType = exType;
}

function arithBlock(){
	unit.call(this, "art");
}


function loadStore(){
	unit.call(this,"mem");
}


arithBlock.prototype = Object.create(unit.prototype);
arithBlock.prototype.constructor = unit;
loadStore.prototype = Object.create(unit.prototype);
loadStore.prototype.constructor = unit;


unit.prototype.idCount = 0;

unit.prototype.fetchCompletedInstruction = function(){

	if(!this.busy && this.completedInstruction !== null){
		console.log(this.id,"giving up",this.completedInstruction);
		var returnValue = this.completedInstruction;
		this.completedInstruction = null;
		this.cycleCount = 0;
		return returnValue;
	}
	return null;
}

unit.prototype.readyToRun = function(){
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

unit.prototype.completeExecution = function(){
	this.busy = false;
	this.completedInstruction = this.instructionBeingWorkedOn;
	this.instructionBeingWorkedOn = null;
}

unit.prototype.fillInstruction = function(decodedInstruction, ROBId){
	if(!this.instructionBeingWorkedOn && !this.completedInstruction)
	{
		// console.log("filling",this.id,"with",decodedInstruction);
		this.ROBId = ROBId;
		this.busy = true;
		this.instructionBeingWorkedOn = decodedInstruction;
		if(this.exType === "mem"){

		}
	}
}

unit.prototype.run = function(Vj, Vk){
			if(config.debug)
				console.log();

			if(!this.readyToRun())
				return;

			this.performCalc(Vj, Vk);

			this.completeExecution();
			return;
}

arithBlock.prototype.performCalc = function(Vj, Vk){
	switch(this.instructionBeingWorkedOn.opCode){
		case 'add':
			this.instructionBeingWorkedOn.returnValue = Vj + Vk;
		break;
		case 'sub':
			this.instructionBeingWorkedOn.returnValue = Vj - Vk;
		break;
		case 'mul':
			this.instructionBeingWorkedOn.returnValue = Vj * Vk;
		break;
		case 'div':
			this.instructionBeingWorkedOn.returnValue = Vj / Vk;
		break;
	}
}

loadStore.prototype.performCalc = function(Vj, Vk){

}


arithBlock.prototype.tickConditions = function(Qj, Qk){
	console.log("TICK", "ARITH", Qj, Qk);
	return (Qj === 0 && Qk === 0);
}

loadStore.prototype.tickConditions = function(Qj, Qk){
	console.log("TICK", "LSU", Qj, Qk);
	// console.log(loadStore.prototype.tickConditions.caller);
	if(!this.instructionBeingWorkedOn)
		return false;
	if(this.instructionBeingWorkedOn.opCode === "str"){
		return (Qj === 0 && reorderBuffer.pointer === this.ROBId);
	}
	else if(this.instructionBeingWorkedOn.opCode === "ldr"){
		//something else
	}
	//should never run
	return false;
}



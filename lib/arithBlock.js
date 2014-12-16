function unit(exType, cycleLimit){
	this.cycleCount = 0;
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
	this.memAddr = 0;
	unit.call(this,"lsu");
}

function branchBlock(){
	this.tempValue = 0;
	unit.call(this,"brc");
}


arithBlock.prototype = Object.create(unit.prototype);
arithBlock.prototype.constructor = unit;
loadStore.prototype = Object.create(unit.prototype);
loadStore.prototype.constructor = unit;
branchBlock.prototype = Object.create(arithBlock.prototype);
branchBlock.prototype.constructor = unit;


unit.prototype.idCount = 0;

unit.prototype.lookupTable = function(opcode){
	switch(opcode){
		case "add":
		case "sub":
			return 1;
		break;
		case "mul":
		case "div":
			return 4;
		break;
		case "ldr":
		case "str":
			return 2;
		break;
		case "bgtz":
		case "bneq":
		case "beq":
		case "blt":
			return 2;
		break;
		case "hlt":
			return 1;
		break;
		default:
			throw "Invalid opcode"+opcode;
		break;
	}
}

unit.prototype.fetchCompletedInstruction = function(){

	if(!this.busy && this.completedInstruction !== null){

		if(config.debug){
			console.log(this.id,"giving up",this.completedInstruction);
		}

		
		var returnValue = this.completedInstruction;
		returnValue.ROBId = this.ROBId;
		this.completedInstruction = null;
		this.cycleCount = 0;
		return returnValue;
	}
	return null;
}

unit.prototype.readyToRun = function(){
	//if theres a completed instruction in waiting or theres nothing to be worked on, leave
	// if(this.exType === "lsu")
	// 	console.log("LSU","R2R",this.completedInstruction, this.instructionBeingWorkedOn, !(!!this.completedInstruction || !this.instructionBeingWorkedOn));
	return !(!!this.completedInstruction || !this.instructionBeingWorkedOn);
}

unit.prototype.readyToComplete = function(){
	//if we're partially through an instruction, just set the value to itself
	// this.instructionBeingWorkedOn = (!decodedInstruction)? this.instructionBeingWorkedOn : decodedInstruction;
	this.cycleCount++;
	return !(this.cycleCount<this.lookupTable(this.instructionBeingWorkedOn.opCode));
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

unit.prototype.run = function(Vj, Vk, extra){
			if(config.debug)
				console.log();

			if(!this.readyToRun())
				return;

			this.performCalc(Vj, Vk, extra);

			if(!this.readyToComplete())
				return;

			this.completeExecution();
			return;
}

branchBlock.prototype.performCalc = function(Vj, Vk){

	switch(this.instructionBeingWorkedOn.opCode){
		case 'blt':
			this.instructionBeingWorkedOn.returnValue = (Vj < Vk);
		break;
		case 'beq':
			this.instructionBeingWorkedOn.returnValue = (Vj == Vk);
			//change to blt to decrease complexity in the writeback stage
			// this.instructionBeingWorkedOn.opCode = 'blt';
		break;
		case 'bneq':
			this.instructionBeingWorkedOn.returnValue = (Vj!=Vk);
			// this.instructionBeingWorkedOn.opCode = 'blt';
		break;
		case 'bgtz':
			this.instructionBeingWorkedOn.returnValue = (Vj > 0);
			// this.instructionBeingWorkedOn.opCode = 'blt';
		break;
	}
}

arithBlock.prototype.performCalc = function(Vj, Vk){
	if(config.debug){
		console.log("PERFORMINGCALC",Vj,Vk);
	}

	if(this.ROBId === 21){
		console.log("PERFORMINGCALC",Vj,Vk, this.instructionBeingWorkedOn);
		// throw false;
	}

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
		case 'cmp':
			if(Vj > Vk){
				this.instructionBeingWorkedOn.returnValue = 1;
			}
			else if(Vj < Vk){
				this.instructionBeingWorkedOn.returnValue = -1;
			}
			else{
				this.instructionBeingWorkedOn.returnValue = 0;
			}
		break;
		case 'hlt':
			this.instructionBeingWorkedOn.returnValue = 0;
		break;
	}
}

loadStore.prototype.performCalc = function(Vj, Vk, offset){
	//change this offset;
	// console.log("LSU","CALC", this.ROBId, Vj, offset, this.cycleCount, this.memAddr);
	if(this.cycleCount === 0)
		this.memAddr = Vj + offset;
	else if(this.instructionBeingWorkedOn.opCode === "ldr")
		this.instructionBeingWorkedOn.returnValue = memoryBus.fetch(this.memAddr);
	else
		this.instructionBeingWorkedOn.returnValue = this.memAddr;

}


arithBlock.prototype.tickConditions = function(Qj, Qk){
	// console.log("TICK", "ARITH", Qj, Qk);
	return (Qj === 0 && Qk === 0);
}

loadStore.prototype.tickConditions = function(Qj, Qk){
	// console.log("TICK", "LSU", Qj, Qk, this.ROBId);
	// console.log(loadStore.prototype.tickConditions.caller);
	if(!this.instructionBeingWorkedOn)
		return false;
	if(this.instructionBeingWorkedOn.opCode === "str"){
		if(reorderBuffer.values[this.ROBId] === undefined)
			return true;
		return (Qj === 0 && reorderBuffer.getPointer() === this.ROBId);
	}
	else if(this.instructionBeingWorkedOn.opCode === "ldr"){
		//something else
		if(this.cycleCount === 0){
			return (Qj === 0 && (reorderBuffer.latestStore === 0 || reorderBuffer.latestStore > this.ROBId))
		}
		else
		{
			//more complicated, hold off on that for now
			return (Qj === 0 && (reorderBuffer.latestStore === 0 || reorderBuffer.latestStore > this.ROBId))
		}
	}
	//should never run
	return false;
}



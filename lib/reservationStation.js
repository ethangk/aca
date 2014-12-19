function reservationStation(type){


	switch(type){
		case "art":
			this.unit = new arithBlock();
		break;
		case "lsu":
			this.unit = new loadStore();
		break;
		case "brc":
			this.unit = new branchBlock();
		break;
		default:
			//change this
			throw "INVALID UNIT";
			return;
		break;
	}
	this.exType = type;
	this.buffer = [];
	this.op = "";
	this.Vj = 0;
	this.Vk = 0;
	this.Qj = 0;
	this.Qk = 0;
	this.busy = false;
	this.A = 0;
	this.dest = 0;
	this.result = null;
}

reservationStation.prototype.placeInstruction = function(instruction, unitEntryConfig, ROBId){

	if(config.debug){
		console.log("PLACE INSTRUCTION", ROBId, instruction, this.busy, this.buffer.length);
	}


	if(this.busy)
		this.buffer.push({instruction:instruction, unitEntryConfig: unitEntryConfig, ROBId: ROBId});
	else if(this.buffer.length !== 0){
		this.buffer.push({instruction:instruction, unitEntryConfig: unitEntryConfig, ROBId: ROBId});
		this.placeNextInstruction();
	}
	else{
		this.fillValues(instruction, unitEntryConfig, ROBId);
	}
}

reservationStation.prototype.fillValues = function(instruction, unitEntryConfig, ROBId){

	if(config.debug){
		console.log("RS","ROB",ROBId, unitEntryConfig, instruction);
	}


	//do something else
	if(!instruction.or1)
		this.Vj = instruction.v1;
	if(!instruction.or2)
		this.Vk = instruction.v2;
	this.unit.fillInstruction(instruction, ROBId);

	this.Qk = unitEntryConfig.Qk;
	this.Vk = unitEntryConfig.Vk;
	this.Qj = unitEntryConfig.Qj;
	this.Vj = unitEntryConfig.Vj;
	this.Vj = unitEntryConfig.Vj;
	this.A  = unitEntryConfig.A;
	this.dest = unitEntryConfig.dest;


	this.op = instruction.opCode;

	this.busy = true;
}

reservationStation.prototype.placeNextInstruction = function(){
	var instruction = this.refreshBuffer(true);
	if(!instruction)
		return;
	if(config.debug){
		console.log("PLACING NEXT INSTRUCTION", instruction, instruction.ROBId);
	}


	this.fillValues(instruction.instruction, instruction.unitEntryConfig, instruction.ROBId);
}

reservationStation.prototype.bufferFull = function(){

	if(config.debug){
		console.log("Checking buffer size for", this.exType, this.buffer.length, config.reservationStationBufferSize);
	}


	return (this.buffer.length === config.reservationStationBufferSize);
}

reservationStation.prototype.getResult = function(){
	// if(this.dest === 21 && this.exType === "lsu" && this.result !== null){
	// 	console.log("DEST-21",this.Vk, this.Vj, this.Qk, this.Qj, this.result !== null, this.result, this.op);
	// 	throw 'stop';
	// }
	if(this.result !== null){
		var returnObject = {ROBId: this.dest, Vk: this.Vk, Vj: this.Vj, or1: this.result.or1,
							or2: this.result.or2, returnValue: this.result.returnValue, original: this.result.original,
							type: this.result.type, v1: this.result.v1, v2: this.result.v2, opCode: this.result.opCode};

		this.busy = false;
		this.result = null;
		this.unit.clearUnit();
		this.placeNextInstruction();
		return returnObject;
	}
	return false;
}

reservationStation.prototype.peekResult = function(){
	if(this.result !== null){
		var resultHolder = this.result;
		var returnObject = {ROBId: resultHolder.ROBId, Vk: this.Vk, Vj: this.Vj, or1: resultHolder.or1,
							or2: resultHolder.or2, returnValue: resultHolder.returnValue, original: resultHolder.original,
							type: resultHolder.type, v1: resultHolder.v1, v2: resultHolder.v2, opCode: resultHolder.opCode};
		return returnObject;
	}
	return false;
}

reservationStation.prototype.refreshBuffer = function(returnItem){
	var returnInstruction = {instruction: null, id: null};
	var updatedBuffer = this.buffer.slice(0);
	for(var i = 0; i<this.buffer.length; i++){
		var tempInstruction = this.buffer[i].unitEntryConfig;
		var a = false;
		var b = false;
		if(!reorderBuffer.getItem(tempInstruction.dest)){
			writeRob();
			writeRegisters();
			writeMem();
			// console.log("DELETING FROM BUFFER", tempInstruction, this.buffer[i]);
			this.buffer.splice(i,1);
			i--;
			continue;
		}
		if(tempInstruction.Qj !== 0 && reorderBuffer.getItem(tempInstruction.Qj).ready){
			tempInstruction.Vj = reorderBuffer.getItem(tempInstruction.Qj).value;
			tempInstruction.Qj = 0;
			a = true;
		}

		if(tempInstruction.Qk !== 0 && reorderBuffer.getItem(tempInstruction.Qk).ready){
			tempInstruction.Vk = reorderBuffer.getItem(tempInstruction.Qk).value;
			tempInstruction.Qk = 0;
			b = true;
		}
		if(returnItem&&a&&b&&!returnInstruction.instruction){
			returnInstruction.instruction = tempInstruction;
			returnInstruction.id = i;
		}
	}
	// this.buffer = updatedBuffer.slice(0);
	if(returnItem){
		if(!returnInstruction.instruction){
			returnInstruction.instruction = this.buffer.shift();
		}
		else{
			returnInstruction.instruction = this.buffer.splice( returnInstruction.id, 1 )[0];
		}

		return returnInstruction.instruction;
	}
	return;

}

reservationStation.prototype.refreshCurrent = function(){


	if(!reorderBuffer.getItem(this.dest)){
		// console.log("getting rid of",this.op,this.dest);
		this.result = true;
		this.getResult();
		return;
	}

	if(this.Qj !== 0 && reorderBuffer.getItem(this.Qj).ready){
		this.Vj = reorderBuffer.getItem(this.Qj).value;
		this.Qj = 0;
	}

	if(this.Qk !== 0 && reorderBuffer.getItem(this.Qk).ready){
		this.Vk = reorderBuffer.getItem(this.Qk).value;
		this.Qk = 0;
	}
	return;
}

// reservationStation.prototype.flushInstructions = function(ROBIds){
// 	for(var i = 0; i<this.buffer.length; i++){
// 		if(ROBIds[this.buffer[i].ROBId] !== undefined){
// 			//flush instruction
// 			delete ROBIds[this.buffer[i].ROBId];
// 			this.buffer.splice(i,1);
// 			i--;
// 		}
// 	}
// 	if(ROBIds[this.dest] !== undefined){
// 		this.result = true;
// 		this.getResult();
// 		//flush current instruction
		
// 	}
// }

reservationStation.prototype.tick = function(){
	// this.placeNextInstruction();
	
	// this.refreshBuffer(false);
	this.refreshCurrent();

	if(!this.busy && this.buffer.length !== 0)
		this.placeNextInstruction();
	// console.log("RS", this.exType, this.Qj, this.Qk, this.A);


	if(this.unit.tickConditions(this.Qj, this.Qk)){
		this.unit.run(this.Vj, this.Vk, this.A);
	}
	var value = this.unit.fetchCompletedInstruction();
	if(!!value){
		//the value is ready, therefore the unit has completed its work
		//do something with it and place another instruction in 
		// console.log("RS","returning",value);
		this.result = value;
	}

}
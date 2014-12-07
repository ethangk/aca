function reservationStation(type){


	switch(type){
		case "art":
			this.unit = new arithBlock();
		break;
		case "lsu":
			this.unit = new loadStore();
		break;
		case "bool":
			this.unit = new boolBlock();
		break;
		default:
			//change this
			this.unit = new arithBlock();
		break;
	}
	this.exType = type;
	this.buffer = new buffer();
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

// reservationStation.prototype.placeInstruction = function(instruction, unitEntryConfig, ROBId){
// 	console.log("PLACE INSTRUCTION", ROBId, instruction, this.busy, this.buffer.values.length);
// 	if(this.busy)
// 		this.buffer.placeInBuffer({instruction:instruction, unitEntryConfig: unitEntryConfig, ROBId: ROBId});
// 	else if(this.buffer.values.length !== 0)
// 		this.placeNextInstruction();
// 	else
// 		this.fillValues(instruction, unitEntryConfig, ROBId);
// }

reservationStation.prototype.placeInstruction = function(instruction, ROBId){
	console.log("RS","ROB",ROBId, instruction);
	//do something else
	if(!instruction.or1)
		this.Vj = instruction.v1;
	if(!instruction.or2)
		this.Vk = instruction.v2;
	this.unit.fillInstruction(instruction, ROBId);


	this.op = instruction.opCode;

	this.busy = true;
}

reservationStation.prototype.placeNextInstruction = function(){
	var instruction = this.buffer.pullFromBuffer();
	console.log("PLACING NEXT INSTRUCTION", instruction, instruction.ROBId);
	this.fillValues(instruction.instruction, instruction.unitEntryConfig, instruction.ROBId);
}

reservationStation.prototype.bufferFull = function(){
	console.log("Checking buffer size for", this.exType, this.buffer.values.length, config.reservationStationBufferSize);
	return (this.buffer.values.length === config.reservationStationBufferSize);
}

reservationStation.prototype.getResult = function(){
	if(this.result !== null){
		var resultHolder = this.result;
		this.busy = false;
		this.result = null;
		return resultHolder;
	}
	return false;
}

reservationStation.prototype.tick = function(){
	// this.placeNextInstruction();
	if(!this.busy && this.buffer.values.length !== 0)
		this.placeNextInstruction();
	// console.log("RS", this.exType, this.Qj, this.Qk, this.A);
	if(this.Qj !== 0 && reorderBuffer.getItem(this.Qj).ready){
		this.Vj = reorderBuffer.getItem(this.Qj).value;
		this.Qj = 0;
	}

	if(this.Qk !== 0 && reorderBuffer.getItem(this.Qk).ready){
		this.Vk = reorderBuffer.getItem(this.Qk).value;
		this.Qk = 0;
	}

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
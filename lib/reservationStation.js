function reservationStation(type){


	switch(type){
		case "art":
			this.unit = new arithBlock();
		break;
		case "lsu":
			this.unit = new loadStore();
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

reservationStation.prototype.placeInstruction = function(instruction){
	if(this.busy)
		this.buffer.placeInBuffer(instruction);
	else
	{
		//do something else
		if(!instruction.or1)
			this.Vj = instruction.v1;
		if(!instruction.or2)
			this.Vk = instruction.v2;
		this.unit.fillInstruction(instruction);

		this.busy = true;
	}
}

reservationStation.prototype.bufferFull = function(){
	return (this.buffer.values.size === config.reservationStationBufferSize);
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
	console.log("RS", this.exType, this.Qj, this.Qk);
	if(this.unit.tickConditions(this.Qj, this.Qk))
		this.unit.run(this.Vj, this.Vk);
	var value = this.unit.fetchCompletedInstruction();
	if(!!value){
		//the value is ready, therefore the unit has completed its work
		//do something with it and place another instruction in 
		console.log("RS","returning",value);
		this.result = value;
	}

}
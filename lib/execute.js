function execute(DE, units){
	this.bufferDE 	= DE;
	this.bufferHold = new buffer();
	this.bufferMEM 	= new buffer();
	this.units = {};
	for(var i = 0; i<units.length; i++){
		if(!this.units[units[i].exType])
			this.units[units[i].exType] = [];
		this.units[units[i].exType].push(units[i]);
	}
	console.log(this.units);
}


execute.prototype.blockTitle = "EX";
execute.prototype.previousInstruction = null;
execute.prototype.currentInstruction = null;

execute.prototype.findAvailableUnit = function(type){
	if(this.units[type] !== undefined){
		for(var i = 0; i<this.units[type].length; i++){
			// console.log(type,"[",i,"]",this.units[type][i].busy);
			if(!this.units[type][i].busy)
				return this.units[type][i];
		}
	}
	return null;
};

execute.prototype.emptyUnits = function(){
	for(var type in this.units){
		if(this.units.hasOwnProperty(type)){
			for(var i = 0; i<this.units[type].length; i++){
				var value = this.units[type][i].fetchCompletedInstruction();
				if(!!value)
					this.bufferMEM.placeInBuffer(value);
			}
		}
	}
}

execute.prototype.progressUnits = function(){
	for(var type in this.units){
		if(this.units.hasOwnProperty(type)){
			for(var i = 0; i<this.units[type].length; i++){
				this.units[type][i].run();
			}
		}
	}
}

execute.prototype.run = function(){
	var unit = true;

	
	// this.progressUnits();
	console.log("Starting ex");
	// if(!this.bufferMEM.isEmpty()){
	// 	this.emptyUnits();
	// 	return;
	// }
	console.log("Made it to while loop in ex");
	while(unit){

		var decodedInstruction = this.bufferDE.peek();
		if(!decodedInstruction)
			break;

		//this can be optimised, if we have a move and a free arth unit, and a ldr is holding everything up, then the move should execute
		unit = this.findAvailableUnit(decodedInstruction.type);
		console.log("Looking for unit",decodedInstruction.type);
		if(!unit)
			break;

		//its just going to set it to the same value, but it'll shift the value off
		decodedInstruction = this.bufferDE.pullFromBuffer();

		if(config.debug)
			console.log(decodedInstruction);


		//do the switcharoo
		// var outObject = {opCode: decodedInstruction.opCode, outValue: 0,
		// 				finalReg: decodedInstruction.result, original: decodedInstruction.original, 
		// 				address: decodedInstruction.address};

		// console.log("or1",decodedInstruction.or1,"wb0",this.writeBack[0].reg,"or2",decodedInstruction.or2,"wb1",this.writeBack[1].reg, decodedInstruction.original);
		unit.fillInstruction(decodedInstruction);
	}
	this.progressUnits();
	this.emptyUnits();
	return;
}
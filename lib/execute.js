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
	console.log("EX", "UNITS", this.units);
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

execute.prototype.progressUnits = function(){
	for(var type in this.units){
		if(this.units.hasOwnProperty(type)){
			for(var i = 0; i<this.units[type].length; i++){
				this.units[type][i].tick();
			}
		}
	}
}

execute.prototype.emptyUnits = function(){
	for(var type in this.units){
		if(this.units.hasOwnProperty(type)){
			for(var i = 0; i<this.units[type].length; i++){
				var unit = this.units[type][i];
				var value = unit.getResult();
				if(!!value){
					var b = unit.dest;
					console.log("VALID VALUE",type,i,b,value.returnValue);

					//very deeply nested loop, this sucks balls. refactor
					for(var typeAlt in this.units){
						if(this.units.hasOwnProperty(typeAlt)){
							for(var j = 0; j<this.units[typeAlt].length; j++){
								if(type === typeAlt && i === j)
									continue;
								//stop b = 0 triggering these
								if(this.units[typeAlt][j].Qj === b && !!b){
									console.log("EMPTYUNITS","Setting",typeAlt,j,value.returnValue);
									this.units[typeAlt][j].Vj = value.returnValue;
									this.units[typeAlt][j].Qj = 0;
								}
								if(this.units[typeAlt][j].Qk === b && !!b){
									console.log("EMPTYUNITS","Setting",typeAlt,j,value.returnValue);
									this.units[typeAlt][j].Vk = value.returnValue;
									this.units[typeAlt][j].Qk = 0;
								}
							}
						}
					}

					console.log("SETTING ",b, "to",value.returnValue);
					if(unit.op === "str"){
						reorderBuffer.setAddress(b, value.returnValue);
						//this might be wrong, the algo doesnt specify to set it to ready
						reorderBuffer.setValue(b, unit.Vk, true);
					}
					else
						reorderBuffer.setValue(b, value.returnValue, true);
					// this.bufferMEM.placeInBuffer(value);
				}
			}
		}
	}
}

execute.prototype.run = function(){
	var unit = true;


	// this.progressUnits();
	// console.log("Starting ex");
	// if(!this.bufferMEM.isEmpty()){
	// 	this.emptyUnits();
	// 	return;
	// }
	// console.log("Made it to while loop in ex");
	while(unit){
		console.log("LATEST", this.latestStore);
		var decodedInstruction = this.bufferDE.peek();
		if(!decodedInstruction)
			break;

		//this can be optimised, if we have a move and a free arth unit, and a ldr is holding everything up, then the move should execute
		unit = this.findAvailableUnit(decodedInstruction.type);
		// console.log("Looking for unit",decodedInstruction.type);
		if(!unit)
			break;

		//its just going to set it to the same value, but it'll shift the value off
		decodedInstruction = this.bufferDE.pullFromBuffer();

		if(config.debug)
			console.log(decodedInstruction);

		if(!decodedInstruction.or1 && !decodedInstruction.or2 && decodedInstruction.type !== "lsu"){
			//this is a mov, bypass ROB for now
			registerBus.push(decodedInstruction.result, decodedInstruction.v1);
			continue;
		}

		var b = reorderBuffer.push(decodedInstruction);


		console.log("PLACING", decodedInstruction, unit, b, decodedInstruction.or1, decodedInstruction.or2);
		unit.placeInstruction(decodedInstruction, b);
		//issue
		if(!!decodedInstruction.or1)
		{
			// console.log("Valid instruction");
			var statusOR1 = registerBus.getStatus(decodedInstruction.or1);
			if(statusOR1.busy){
				var h = statusOR1.reorder;
				console.log("ROB", "OR1", h);

				if(reorderBuffer.getItem(h).ready){
					//instruction already completed
					console.log("ROB","OR1",h,"READY");
					unit.Vj = reorderBuffer.getItem(h).value;
					unit.Qj = 0;
				}
				else{
					console.log("ROB","OR1",h,"NOT READY");
					unit.Qj = h;
					//wait for instruction
				}
			}
			else{
				console.log("ROB","OR1","NOT NEEDED");
				unit.Vj = registerBus.fetch(decodedInstruction.or1);
				unit.Qj = 0;
			}

			unit.busy = true;

			//in this case, b is the entry in the reorder buffer
			// console.log("Setting unit",unit.unit.id,"dest to",b);
			unit.dest = b;

			// reorderBuffer[b].instruction = decodedInstruction.opCode;
			// reorderBuffer[b].dest = decodedInstruction.result;
			// reorderBuffer[b].ready = false;
		}

		if(!!decodedInstruction.or2){
			if(decodedInstruction.type === "art" || decodedInstruction.opCode === "str"){
				var statusOR2 = registerBus.getStatus(decodedInstruction.or2);
				if(statusOR2.busy){
					var h = statusOR2.reorder;
					console.log("ROB","OR2",h);
					if(reorderBuffer.getItem(h).ready){
						console.log("ROB","OR2",h,"READY");
						unit.Vk = reorderBuffer.getItem(h).value;
						unit.Qk = 0;
					}
					else{
						console.log("ROB","OR2",h,"NOT READY");
						//tell it to set its wait target to reorder buffer h
						unit.Qk = h;
					}
				}
				else{
					console.log("ROB","OR2","NOT NEEDED");
					unit.Vk = registerBus.fetch(decodedInstruction.or2);
					unit.Qk = 0;
				}
			}
		}


		if(decodedInstruction.type === "art"){
			console.log("Setting reg state");
			registerBus.pushStatus(decodedInstruction.result, true, b);

		}

		if(decodedInstruction.opCode === "ldr"){
			unit.A = decodedInstruction.offset;
			registerBus.pushStatus(decodedInstruction.or2, true, b);
			reorderBuffer.setDest(b, decodedInstruction.or2);
		}

		if(decodedInstruction.opCode === "str"){
			unit.A = decodedInstruction.offset;
			if(reorderBuffer.latestStore === 0)
				reorderBuffer.latestStore = b;
		}
	}
	this.progressUnits();
	this.emptyUnits();
	reorderBuffer.commit();
	return;
}
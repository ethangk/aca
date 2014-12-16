function write(){

}

write.prototype.run = function(){

	if(config.debug){
		console.log("STARTING WRITE");
	}


	for(var type in reservationStations.units){
		if(reservationStations.units.hasOwnProperty(type)){
			for(var i = 0; i<reservationStations.units[type].length; i++){
				var unit = reservationStations.units[type][i];
				var value = unit.getResult();
				if(value !== false){
					//change this for a more elegant solution
					var b = value.ROBId;

					if(reorderBuffer.getItem(b) === undefined){
						//entry no longer exists
						// console.log("INVLID",b,value.opCode);
						continue;
					}


					if(config.debug){
						console.log("VALID VALUE",type,i,b,value.returnValue, value, unit.op);
					}

					//very deeply nested loop, this sucks balls. refactor
					for(var typeAlt in reservationStations.units){
						if(reservationStations.units.hasOwnProperty(typeAlt)){
							for(var j = 0; j<reservationStations.units[typeAlt].length; j++){
								if(type === typeAlt && i === j)
									continue;
								//stop b = 0 triggering these
								if(reservationStations.units[typeAlt][j].Qj === b && !!b){
									//. console.log("EMPTYUNITS","Setting",typeAlt,j,value.returnValue);
									reservationStations.units[typeAlt][j].Vj = value.returnValue;
									reservationStations.units[typeAlt][j].Qj = 0;
								}
								if(reservationStations.units[typeAlt][j].Qk === b && !!b){
									//. console.log("EMPTYUNITS","Setting",typeAlt,j,value.returnValue);
									reservationStations.units[typeAlt][j].Vk = value.returnValue;
									reservationStations.units[typeAlt][j].Qk = 0;
								}
							}
						}
					}


					if(config.debug){
						console.log("SETTING ",b, "to",value.returnValue,"TYPE",type);
					}


					if(value.opCode === "str"){
						// console.log("STORING",value.Vk,"in",value.returnValue,"row");
						reorderBuffer.setAddress(b, value.returnValue);
						//this might be wrong, the algo doesnt specify to set it to ready
						reorderBuffer.setValue(b, value.Vk, true);

					}
					else{
						reorderBuffer.setValue(b, value.returnValue, true);
					}
					// unit.getResult();
					// this.bufferMEM.placeInBuffer(value);
				}
			}
		}
	}
}
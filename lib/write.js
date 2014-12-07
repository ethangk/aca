function write(){

}

write.prototype.run = function(){
	console.log("STARTING WRITE");
	for(var type in reservationStations.units){
		if(reservationStations.units.hasOwnProperty(type)){
			for(var i = 0; i<reservationStations.units[type].length; i++){
				var unit = reservationStations.units[type][i];
				var value = unit.getResult();
				if(!!value){
					//change this for a more elegant solution
					var b = value.ROBId;
					console.log("VALID VALUE",type,i,b,value.returnValue, value);

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

					console.log("SETTING ",b, "to",value.returnValue,"TYPE",type);
					if(unit.op === "str"){
						reorderBuffer.setAddress(b, value.returnValue);
						//this might be wrong, the algo doesnt specify to set it to ready
						reorderBuffer.setValue(b, unit.Vk, true);
					}
					else{

						reorderBuffer.setValue(b, value.returnValue, true);
					}
					// this.bufferMEM.placeInBuffer(value);
				}
			}
		}
	}
}
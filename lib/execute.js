function execute(DE, units){
	this.bufferDE 	= DE;
	this.bufferHold = new buffer();
	this.bufferMEM 	= new buffer();
}


execute.prototype.run = function(){
	for(var type in reservationStations.units){
		if(reservationStations.units.hasOwnProperty(type)){
			for(var i = 0; i<reservationStations.units[type].length; i++){
				reservationStations.units[type][i].tick();
			}
		}
	}
	return;
}
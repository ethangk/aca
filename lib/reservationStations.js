var reservationStations = {
	units: {},
	init: function(units){
		for(var i = 0; i<units.length; i++){
			if(!this.units[units[i].exType])
				this.units[units[i].exType] = [];
			this.units[units[i].exType].push(units[i]);
		}
		unitRef = this.units;
	},
	findAvailableUnit: function(type){
		var emptiest = null;
		var smallestValue = config.reservationStationBufferSize+1;
		var currentLength = 0;
		if(this.units[type] !== undefined){
			for(var i = 0; i<this.units[type].length; i++)
				if(!this.units[type][i].busy)
					return this.units[type][i];
		}
		return null;
	}
};
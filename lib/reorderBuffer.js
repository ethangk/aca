var reorderBuffer = {
	pointer: 1,
	latestStore: 0,
	values: {},
	valuesLength: 1,
	possibleStates: {issue: 1, execute: 2, write: 3, commit: 4},
	push: function(decodedInstruction, storedPC){
		var newEntry = {
			id:this.valuesLength,
			busy: true,
			instruction: decodedInstruction,
			state: this.possibleStates.issue,
			destination: decodedInstruction.result,
			ready: false,
			value: null,
			address: null
		};
		if(storedPC !== undefined && storedPC !== -1){
			newEntry.storedPC = storedPC;
		}
		this.values[this.valuesLength] = newEntry;
		this.valuesLength++;
		if(this.valuesLength > 23){
			console.log("ISSUING", this.valuesLength-1, decodedInstruction.original);
		}
		// this.values.push(newEntry);
		// console.log("Returning entry ", this.values.length - 1, " for buffer ", this.values);

		return this.valuesLength - 1;
	},
	setState: function(entry, state){
		this.values[entry].state = this.possibleStates[state.toLower()];
	},
	shift: function(){
		this.changePointer(1);
		// this.pointer++;
		return this.values.shift();
	},
	getItem: function(id){
		return this.values[id];
	},
	setItem: function(id, busy, instruction, state, destination, ready, value){
		if(!this.values[id])
			return false;
		this.values[id].busy = busy || this.values[id].busy;
		this.values[id].instruction = instruction || this.values[id].instruction;
		this.values[id].state = state || this.values[id].state;
		this.values[id].destination = destination || this.values[id].destination;
		this.values[id].ready = ready || this.values[id].ready;
		this.values[id].value = value || this.values[id].value;
		return true;
	},
	setValue: function(id, value, ready){
		if(!this.values[id] || value === undefined)
			return false;
		this.values[id].value = value;
		if(ready === undefined)
			return;
		this.values[id].ready = ready;
		return true;
	},
	setDest: function(id, dest){
		if(!this.values[id] || dest === undefined)
			return;
		this.values[id].dest = dest;
	},
	setAddress: function(id, address){
		if(!this.values[id] || !address)
			return;
		this.values[id].address = address;
	},
	reset: function(){
		this.values = {};
		this.valuesLength = 1;
		// this.pointer = 1;
		this.setPointer(1);
	},
	setPointer: function(value){
		this.pointer = value;
	},
	changePointer: function(value){
		this.pointer+=value;
	},
	getPointer: function(){
		return this.pointer;
	},
	deleteItem: function(id){
		console.log("DELETING",id);
		if(!this.values[id]){
			return false;
		}
		delete this.values[id];
		this.valuesLength--;
		return true;
	}


};


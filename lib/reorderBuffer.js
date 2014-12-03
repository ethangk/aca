var reorderBuffer = {
	pointer: 0,
	values: [{}],
	possibleStates: {issue: 1, execute: 2, write: 3, commit: 4},
	push: function(decodedInstruction){
		var newEntry = {
			busy: true,
			instruction: decodedInstruction,
			state: this.possibleStates.issue,
			destination: decodedInstruction.result,
			ready: false,
			value: null
		};
		this.values.push(newEntry);
		console.log("Returning entry ", this.pointer + this.values.length - 1, " for buffer ", this.values);
		return this.pointer + this.values.length - 1;
	},
	setState: function(entry, state){
		this.values[entry].state = this.possibleStates[state.toLower()];
	},
	shift: function(){
		this.pointer++;
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
		if(!this.values[id] || !value)
			return false;
		this.values[id].value = value;
		if(ready === undefined)
			return;
		this.values[id].ready = ready;

	},
	setDest: function(id, dest){
		if(!this.values[id] || !dest)
			return;
		this.values[id].dest = dest;
	},
	reset: function(){
		this.values = [{}];
		this.pointer = 0;
	}


};


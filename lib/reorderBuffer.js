var reorderBuffer = {
	pointer: 1,
	latestStore: 0,
	values: [{}],
	possibleStates: {issue: 1, execute: 2, write: 3, commit: 4},
	push: function(decodedInstruction){
		var newEntry = {
			busy: true,
			instruction: decodedInstruction,
			state: this.possibleStates.issue,
			destination: decodedInstruction.result,
			ready: false,
			value: null,
			id: this.values.length,
			address: null
		};
		this.values.push(newEntry);
		// console.log("Returning entry ", this.values.length - 1, " for buffer ", this.values);

		return this.values.length - 1;
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
		if(!this.values[id] || value === undefined)
			return false;
		this.values[id].value = value;
		if(ready === undefined)
			return;
		console.log("UPDATING VALUE", id, value, ready);
		this.values[id].ready = ready;

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
		this.values = [{}];
		this.pointer = 1;
	},
	commit: function(){
		var head = this.values[this.pointer];
		if(!head)
			return;
		console.log("ROB", this.pointer, head);
		if(head.ready){
			console.log("COMMIT", this.pointer, head);
			var d = head.destination;
			//if its a branch, deal with that later...
			if(head.instruction.opCode === "branch"){

			}
			else if(head.instruction.opCode === "str"){
				//desination address
				memoryBus.push(head.address, head.value);
				if(head.id === this.latestStore){
					//latest store is done, lets update
					for(var k = this.latestStore+1; k<this.values.length; k++){
						if(this.values[k].instruction.opCode === "str"){
							this.latestStore = k;
							break;
						}
					}
					if(head.id === this.latestStore){
						//no update was made to latestStore
						this.latestStore = 0;
					}
				}
			}
			else{
				registerBus.push(d, head.value);
			}
			head.busy = false;
			this.pointer++;
			var regStat = registerBus.getStatus(d);
			if(regStat.reorder === head.id)
				registerBus.pushStatus(d,false,0);
		}
	}


};


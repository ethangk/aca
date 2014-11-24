
var instructionBus = {
	instructions: {},
	numInstructions: 0,
	currentInstruction: '',
	fetch: function(address){
		return this.instructions[address];
	},
	fetchPC: function(){
		var instruction = this.instructions[PCBus.fetch()];
		this.currentInstruction = instruction;
		PCBus.increment(config.instructionLength);
		return instruction;
	},
	push: function(address, value){
		if(this.instructions[address] === undefined){
			this.numInstructions++;
		}
		this.instructions[address] = value;
	},
	reset: function(){
		this.instructions = {};
		this.numInstructions = 0;
	}
};

var PCBus = {
	value: 0,
	fetch: function(){
		return this.value;
	},
	push: function(newValue){
		this.value = newValue;
	},
	increment: function(amount){
		this.value += amount;
	},
	reset: function(){
		this.value = 0;
	}
};


var memoryBus = {
	memory: {},
	fetch: function(address){
		if(address%config.instructionLength !== 0){
			console.log("WORD LENGTH ERROR");
		}
		if(config.debug)
			console.log("FETCH MEM",address, this.memory[address]);
		return this.memory[address];
	},
	push: function(address, value){
		if(address%config.instructionLength !== 0){
			console.log("WORD LENGTH ERROR");
		}
		if(config.debug)
			console.log("PUSH MEM",address,value);
		this.memory[address] = parseInt(value,10);
	},
	reset: function(){
		this.memory = {};
	}
};

var registerBus = {
	numRegisters: 0,
	registers: {},
	registerExists: function(register){
		if(this.registers[register] === undefined){
			console.log("INVALID REGISTER ACCESS", register);
			return false;
		}
		return true;
	},
	parseReg: function(register){
		if(register.charAt(0) === '$'){
			register = register.slice(1);
		}
		return register;
	},
	fetch: function(register){
		register = this.parseReg(register);
		if(!this.registerExists(register)){
			return false;
		}
		return parseInt(this.registers[register],10);
	},
	push: function(register, value){
		register = this.parseReg(register);
		if(!this.registerExists(register)){
			return false;
		}
		this.registers[register] = parseInt(value,10);
	},
	initReg: function(numReg){
		this.numRegisters = numReg || 32;
		for(var i = 0; i<this.numRegisters; i++){
			//avoid using push as this actually creates the register, whereas push will check for existence
			this.registers['r'+i] = 0;
		}
		console.log("Init reg on", this.numRegisters);
	},
	reset: function(){
		this.numRegisters = 0;
		this.registers = {};
	}
};

var bypass = {
	store: {},
	addItem: function(register, address, value){
		if(store[register] === undefined){
			store[register] = {};
		}
		if(store[register][address] === undefined){
			store[register][address] = value;
		}
	},
	removeItem: function(register, address){
		if(store[register] !== undefined && store[register][address] !== undefined){
			delete store[register][address];
		}
	},
	needsBypass: function(register){
		if(store[register] !== undefined && store[register][address] !== undefined){
			return store[register][address];
		}
	}
};
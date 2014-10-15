
var instructionBus = {
	instructions: {},
	numInstructions: 0,
	fetch: function(address){
		return this.instructions[address];
	},
	fetchPC: function(){
		var instruction = this.instructions[PCBus.fetch()];
		PCBus.increment(config.instructionLength);
		return instruction;
	},
	push: function(address, value){
		if(this.instructions[address] === undefined){
			this.numInstructions++;
		}
		this.instructions[address] = value;
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
	}
};


var memoryBus = {
	memory: {},
	fetch: function(address){
		if(address%config.instructionLength !== 0){
			console.log("WORD LENGTH ERROR");
		}
		return this.memory[address];
	},
	push: function(address, value){
		if(address%config.instructionLength !== 0){
			console.log("WORD LENGTH ERROR");
		}
		this.memory[address] = value;
	}
};

var registerBus = {
	numRegisters: 0,
	registers: {},
	fetch: function(register){
		return this.registers[register];
	},
	push: function(register, value){
		this.registers[register] = value;
	},
	initReg: function(numReg){
		this.numRegisters = numReg;
		for(var i = 0; i<numReg; i++){
			this.push('r'+i, 0);
		}
	}
};

var states = {addresses: []};

var config = {	instructionLength: 4 };

/*

High level pipeline overview
IF pulls an instruction from memory
DE works out what the instruciton wants, fetches values from registers
EX actually executes the instruction
WB writes values back to the registers

*/

function fillInstructions(inst){
	var tempPC = 0;
	inst.forEach(function(v){
		instructionBus.push(tempPC, v);
		tempPC+=config.instructionLength;
	});
}

function updateState(address, registers){
	states[address] = registers;
	states['addresses'].push(address);

	if(states.addresses.length > 20){
		delete states[states.addresses[0]];
		states.addresses.shift();	
	}
}


function instructionFetch(){
	return {
	run : function(){
			return instructionBus.fetchPC();
		}
	};
}


function decode(){
	return {

	instructionTypes: {'art': ['add','sub','cmp','div','mul'], 'ope': ['mov'], 'mem': ['ldr', 'str']},
	run: function(instruction){
				if(instruction === false){
					return;
				}

				var splitInstruction 	= instruction.split(',');
				var opCode 				= splitInstruction[0].toLowerCase();
				var decodedInstruction 	= {result: splitInstruction[1]};

				if(this.instructionTypes['art'].indexOf(opCode) > -1){
					decodedInstruction['v1'] = parseInt(registerBus.fetch(splitInstruction[2]), 10);
					decodedInstruction['v2'] = parseInt(registerBus.fetch(splitInstruction[3]), 10);
				}
				else if(this.instructionTypes['ope'].indexOf(opCode) > -1){
					decodedInstruction['imm']  = parseInt(splitInstruction[2],10);
				}
				else if(this.instructionTypes['mem'].indexOf(opCode) > -1){
					if(instruction.charAt(instruction.length-1) === ']'){
						//has offset
						decodedInstruction['offset'] 	= splitInstruction['3'].slice(0,-1);
						decodedInstruction['memaddr']	= parseInt(registerBus.fetch(splitInstruction['2'].slice(1)), 10);
					}
					else{
						decodedInstruction['offset'] = 0;
						decodedInstruction['memaddr'] = parseInt(registerBus.fetch(splitInstruction['2']), 10);
					}
					if(opCode === 'str'){
						decodedInstruction['result'] = parseInt(registerBus.fetch(splitInstruction[1]), 10);
					}
				}
				else{
					console.log("Invalid instruction");
				}


				decodedInstruction.opCode = opCode;
				return decodedInstruction;	
			}
	};
}

function execute(){


	return {
		run : function(decodedInstruction){
			var outValue = 0;
			var outObject = {opCode: decodedInstruction.opCode, outValue: 0, finalReg: decodedInstruction.result};
			switch(decodedInstruction.opCode){
					case 'add':
						outObject.outValue = decodedInstruction.v1 + decodedInstruction.v2;
					break;
					case 'sub':
						outObject.outValue = decodedInstruction.v1 - decodedInstruction.v2;
					break;
					case 'mul':
						outObject.outValue = decodedInstruction.v1 * decodedInstruction.v2;
					break;
					case 'div':
						outObject.outValue = decodedInstruction.v1 / decodedInstruction.v2;
					break;
					case 'mov':
						outObject.outValue = decodedInstruction.imm;
					break;
					case 'cmp':
						if(decodedInstruction.v1 > decodedInstruction.v2){
							outObject.outValue = 1;
						}
						else if(decodedInstruction.v1 < decodedInstruction.v2){
							outObject.outValue = -1;
						}
						else{
							outObject.outValue = 0;
						}
					break;
					case 'ldr':
						outObject.outValue = decodedInstruction.memaddr + decodedInstruction.offset;
					break;
					case 'str':
						outObject.outValue = decodedInstruction.memaddr + decodedInstruction.offset;
					break;

				}

			return outObject;
		}
	};
}

function memoryAccess(){
	return{
		run: function(item){
			if(item.opCode === 'ldr'){
				item.outValue = memoryBus.fetch(item.outValue);
			}
			else if(item.opCode === 'str'){
				memoryBus.push(item.outValue, item.finalReg);
			}
			return item;
		}
	}
}

function writeBack(){
	return {
		run: function(item){
			registerBus.push(item.finalReg, item.outValue);
		}
	};
}

function tick(IF,DC,EX,MA,WB){
	WB.run(	MA.run(EX.run(	DC.run(	IF.run()))));
	console.log(registerBus.registers);
	console.log(memoryBus.memory);
	// updateState(pc, registers);
}

function run(){

	fillInstructions(
		['mov,r1,40', 'add,r0,r1,r1','str,r0,r1', 'ldr,r10,r1']
	);

	registerBus.initReg(32);
	console.log(instructionBus.instructions);


	var IF = new instructionFetch();
	var DC = new decode();
	var EX = new execute();
	var MA = new memoryAccess();
	var WB = new writeBack();

	console.log(instructionBus.numInstructions);
	for(var i = 0; i<instructionBus.numInstructions; i++){
		tick(IF, DC, EX, MA, WB);
	}
}



run();
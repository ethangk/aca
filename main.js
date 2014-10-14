var instructions;
var pc = 0;
var memory = [];
var states = {addresses: []};
var registers = [];

var config = {	instructionLength: 4 };

/*

High level pipeline overview
IF pulls an instruction from memory
DE works out what the instruciton wants, fetches values from registers
EX actually executes the instruction
WB writes values back to the registers

*/


function updateState(address, registers){
	states[address] = registers;
	states['addresses'].push(address);

	if(states.addresses.length > 20){
		delete states[states.addresses[0]];
		states.addresses.shift();	
	}
}


function instructionBus(){
	pc += config.instructionLength;
	return instructions[pc];
}

var instructionFetch = {
	remainingCycles : 0,

	run : function(){

			if(this.remainingCycles > 0){
				this.remainingCycles -= 1;
				return false;
			}
			return instructionBus();
		}
}

var decode = {
	remainingCycles : 0,
	run: function(instruction){
			if(this.remainingCycles > 0){
					this.remainingCycles -= 1;
					return 0;
				}
				if(instruction === false){
					return;
				}
				var decodedInstruction = new Instruction(instruction);
				return new Instruction(instruction);	
			}
	}

var execute = {

	remainingCycles: 0,
	run : function(decodedInstruction){
		if(this.remainingCycles > 0){
			this.remainingCycles -= 1;
			return 0;
		}
	}
}

function writeBack(){

}

function tick(IF,DC,EX,WB){
	WB(	EX.run(	DC.run(	IF.run())));
	updateState(pc, registers);
}

function run(){

	instructions = [1,2,3];

	var IF = instructionFetch;
	var DC = decode;
	var EX = execute;
	var WB = writeBack;

	tick(IF, DC, EX, WB);
}

function instrucionTest(){
	var ins = new Instruction(100000000);
	ins.decode();
	console.log(ins);
	ins.fetchReg();
}

instrucionTest();
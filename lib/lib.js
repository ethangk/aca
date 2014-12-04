var exobjects;
function readTextFile(file)
{
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", 'asm/'+file+'#'+Math.random(), true);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			var allText = rawFile.responseText;
			document.getElementById("textbox").innerHTML = allText;
			var parsed = parseInput(allText);


			reset();
			writeRegisters();

			fillInstructions(parsed.instructions);
			fillLabels(parsed.labels);
			fillMem(parsed.memStores);
			exobjects = initProgram();
			writeMem();
		}
	}

	rawFile.send();
}

function parseInput(input){
	var instructions = [];
	var labels = [];
	var memStores = [];
	var instructionCount = 0;
	input.split("\n").forEach(function(item){
		if(item.charAt(0) === ' ' || item.charAt(0) === '\t'){
			//not a label, its an instruction then
			item = item.trim();
			if(item.charAt(0) === '.'){
				//store in mem instruction
				item.slice(5).split(',').forEach(function(i){
					memStores.push({address: instructionCount, value: i.trim()});
					instructionCount++;
				});
			}
			else{
				instructions.push(item);
				instructionCount++;
			}
		}
		else if(item.trim().length != 0){
			labels.push({label: item, currentInstruction: parseInt(instructionCount,10)});
		}
	});
	return {labels: labels, instructions: instructions, memStores: memStores};
}

function writeRegisters(){
	var contents = "";
	var regValue = 0;
	contents += "Current Instruction<br/>" + instructionBus.currentInstruction + "<br />";
	for(var i = 0; i<registerBus.numRegisters; i++){
		regValue = registerBus.fetch('r'+i);
		contents+="r"+i+"<input type='text' id='reg" + i + "' value='" + regValue + "'><br />";
	}
	document.getElementById('registers').innerHTML = contents;
}


function writeMem(){
	var contents = "Memory<br />";
	for(var i in memoryBus.memory){
		if(memoryBus.memory.hasOwnProperty(i)){
			contents+=i+":"+memoryBus.memory[i]+"<br />";
		}
	}
	document.getElementById('memory').innerHTML = contents;
	writePipeline();
}

function writePipeline(){
	var contents = "";
	for(var i in pipeline){
		if(pipeline.hasOwnProperty(i)){
			contents+=i+":"+dumpObject(pipeline[i])+"<br />";
		}
	}
	document.getElementById('pipeline').innerHTML = contents;
}

function logRob(){
	for(var i = reorderBuffer.pointer; i<reorderBuffer.values.length; i++)
		console.log(reorderBuffer.values[i]);
}

function dumpObject(obj){
	if(typeof obj === "string")
		return obj;
	var contents = "";
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			contents+=i+":"+obj[i] + " | ";
		}
	}
	return contents.slice(0,-3);
}

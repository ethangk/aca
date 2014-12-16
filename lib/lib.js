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
	var contents = "PC = ";
	// for(var i in pipeline){
	// 	if(pipeline.hasOwnProperty(i)){
	// 		contents+=i+":"+dumpObject(pipeline[i])+"<br />";
	// 	}
	// }
	contents += PCBus.fetch();
	document.getElementById('pipeline').innerHTML = contents;
}

function logRob(full){
	var i = reorderBuffer.getPointer();
	if(full)
		i = 0;
	for(; i<reorderBuffer.valuesLength; i++)
		console.log(reorderBuffer.values[i]);
}

function logUnits(){
	for(var unit in unitRef)
	{
		if(unitRef.hasOwnProperty(unit)){
			console.log(unit);
			for(var i = 0; i<unitRef[unit].length; i++)
				console.log(unitRef[unit][i]);
		}
	}
}

function writeUnits(){
	var contents = "";
	for(var unit in unitRef){
		if(unitRef.hasOwnProperty(unit)){
			contents += unit + "<br />";
			for(var i = 0; i<unitRef[unit].length; i++){
				var u = unitRef[unit][i];
				contents+"&#09;";
				if(u.busy){
					var orig = "none";
					if(!!u.unit.instructionBeingWorkedOn)
						orig = u.unit.instructionBeingWorkedOn.original;
					contents+="Busy | "+orig+" being placed in ROB["+u.dest+"], with buffer length " + u.buffer.length+"<br />";
					
				}
				else{
					contents+="Not busy<br />";
				}
			}
		}
	}
	document.getElementById('units').innerHTML = contents;
}

function writeRob(){
	var contents = document.getElementById('units').innerHTML;
	contents+="POINTER = "+reorderBuffer.getPointer()+"<br />";
	for(var i = reorderBuffer.valuesLength-1; i>0; i--)
		contents+=reorderBuffer.values[i].id+", " + reorderBuffer.values[i].ready +", " + reorderBuffer.values[i].value + "," + reorderBuffer.values[i].instruction.original +"<br />";
	document.getElementById('units').innerHTML = contents;
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

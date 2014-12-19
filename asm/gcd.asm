start
	ldr $r0, itemA
	ldr $r1, itemB
loopStart
	beq end, $r0, $r1
loop
	blt subA, $r1, $r0
	jmp subB
subA
	sub $r0, $r0, $r1
	jmp loopStart
subB
	sub $r1, $r1, $r0
	jmp loopStart
end
	hlt
itemA
	.word 101910191019
itemB
	.word 777777777
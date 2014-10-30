fillarray
	mov $r0,10
	muli $r1,$r0,2
	muli $r1,$r1,4
	mov $r2,0
	mov $r3,0
fillloop
	str $r3,$r3
	addi $r3,$r3,4
	blt fillloop,$r3,$r1
zero
	mov $r1,0
	mov $r2,0
vectorloop
	muli $r7,$r0,4
	ldr $r3,$r2
	add $r4,$r2,$r7
	ldr $r5,$r4
	add $r9,$r3,$r5
	add $r1,$r1,$r9
	addi $r6,$r6,1
	addi $r2,$r2,4
	blt vectorloop,$r6,$r0
	hlt
array
	.word 10,20, 30, 44, 55
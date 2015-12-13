function getDivisor(RepaymentType) {
        switch(RepaymentType) {
                case "Monthly":
                        payments = 12;
                break;
                case "Fortnightly":
                        payments = 26;
                break;
                case "Weekly":
                        payments = 52;
                break;
        }

	return payments
}

function getEffectiveInterest(AnnualInterestRate,RepaymentFrequency) {
	divs = getDivisor(RepaymentFrequency);
	EffectiveInterest = AnnualInterestRate/divs;
	return EffectiveInterest;
}

function getNumberOfPayments(LoanTerm,RepaymentType) {
	payments = getDivisor(RepaymentType);
	return LoanTerm*payments;
}


function getRepaymentAmount(LoanAmount,AnnualInterestRate,RepaymentFrequency,NumberOfPayments,LoanType) {
	EffectiveInterest = getEffectiveInterest(AnnualInterestRate,RepaymentFrequency);
	if(LoanType == 'PI') {
		numerator = EffectiveInterest*(Math.pow(1+EffectiveInterest,NumberOfPayments));
		denominator = (Math.pow(1+EffectiveInterest,NumberOfPayments))-1;
		amount = LoanAmount*numerator/denominator;
	} else {
		amount = LoanAmount*EffectiveInterest;
	}
	return amount;
}


function getMortgageDetails() {
	objFields = {}
	$('#MortgageDetails').find('input[type=text],select').each(function(ind,val){
		field = $(val);
		fieldname = field.attr('id');
		fieldvalue = field.val();
		if(fieldname === 'LoanAmount') {
			objFields[fieldname] = parseInt(fieldvalue);
		} else if(fieldname === 'LoanInterestRate') {
			objFields[fieldname] = fieldvalue/100;
		} else {
			objFields[fieldname] = fieldvalue;
		}
	});
	
	$('#MortgageDetails').find('input[type=radio]').each(function(ind,val){
		radio = $(val);
		if(radio.prop('checked')) {
			objFields['LoanOffsetAccount'] = radio.val();
		}
	});

	return objFields;
}

function getRepaymentBreakdown(LoanAmount,RepaymentAmount,EffectiveInterestRate) {
	InterestPayment = LoanAmount*EffectiveInterestRate;
	PrincipalPayment = RepaymentAmount-InterestPayment;
	objPayments = {"InterestPayment":InterestPayment,"PrincipalPayment":PrincipalPayment};
	return objPayments;
}

function getRepaymentDates(StartDate,RepaymentFrequency,NumberOfPayments) {
	switch(RepaymentFrequency) {
		case "Monthly":
			addObj = {months:1};
		break;
		case "Fortnightly":
			addObj = {weeks:2};
		break;
		case "Weekly":
			addObj = {weeks:1};
		break;
	}
	arrDates = [];
	arrDates.push([StartDate]);
	var start = moment(StartDate);
	for(payment = 0; payment < NumberOfPayments; payment++) {
		start.add(addObj);
		strDate = start.format('YYYY-MM-DD')
		arrDates.push([strDate]);
	}
	return arrDates;
}

function generateFormulas(data,LoanAmount,AnnualInterestRate,RepaymentFrequency,RepaymentAmount,objBreakdown,LoanType,Offset,OffsetBalance) {
	EffectiveInterestRate = getEffectiveInterest(AnnualInterestRate,RepaymentFrequency);
	
	for(row in data) {
		if(row == 0) {
			
			data[row].push(LoanAmount);
			if(Offset == "Yes") {
				data[row].push(((LoanAmount-OffsetBalance)*EffectiveInterestRate));
			} else {
				data[row].push((LoanAmount*EffectiveInterestRate));
			}
			data[row].push(RepaymentAmount)
			
			console.log(data[row]);
		} else {
			
			prevRowLoanAmountFormula = '=B'+row+'+C'+row+'-D'+row;
			data[row].push(prevRowLoanAmountFormula);

			prevRowInterestFormula = '=B'+(parseInt(row)+1)+'*'+EffectiveInterestRate;
                        if(Offset == "Yes") {
                                data[row].push(((LoanAmount-OffsetBalance)*EffectiveInterestRate).toFixed(2));
                        } else {
                                data[row].push(prevRowInterestFormula);
                        }
			data[row].push(RepaymentAmount.toFixed(2));
			
		}
	}

	return data;
}

function DisplaySpreadsheet(data) {
	var sheet = $('#spreadsheet');
	sdata = data;

	sheet.handsontable({
		data:data,
		rowHeaders: true,
		colHeaders: true,
		contextMenu: true,
		manualColumnResize: true,
		formulas: true
	});
}

function CalculateMortgage() {
	objFields = getMortgageDetails();
	
	console.log(objFields);

	LoanAmount = objFields['LoanAmount'];
	LoanInterestRate = objFields['LoanInterestRate'];
	LoanTerm = objFields['LoanTerm'];
	LoanType = objFields['LoanType'];
	LoanRepaymentDate = objFields['LoanRepaymentDate'];
	LoanRepaymentFrequency = objFields['LoanRepaymentFrequency'];
	LoanOffsetAccount = objFields['LoanOffsetAccount'];
	LoanOffsetAccountBalance = objFields['LoanOffsetAccoutnBalance'];
	

	NumberOfPayments = getNumberOfPayments(LoanTerm,LoanRepaymentFrequency);
	InitialRepaymentAmount = getRepaymentAmount(LoanAmount,LoanInterestRate,LoanRepaymentFrequency,NumberOfPayments,LoanType);
	PaymentBreakdown = getRepaymentBreakdown(LoanAmount, InitialRepaymentAmount, getEffectiveInterest(LoanInterestRate,LoanRepaymentFrequency));
	arrPaymentDates = getRepaymentDates(LoanRepaymentDate,LoanRepaymentFrequency,NumberOfPayments);
	arrMortgageData = generateFormulas(arrPaymentDates,LoanAmount,LoanInterestRate,LoanRepaymentFrequency,InitialRepaymentAmount,PaymentBreakdown,LoanType,LoanOffsetAccount,LoanOffsetAccountBalance);
	
	DisplaySpreadsheet(arrMortgageData);

	//console.log(arrPaymentDates);

	//console.log(objFields);
}

$().ready(function(){
	$('#LoanRepaymentDate').datepicker({
		dateFormat:"yy-mm-dd"
	});

	$('#btnCalculate').click(function(){
		CalculateMortgage();
	});

	$('#LoanOffsetAccountYes').parent().click(function(){
		$('#LoanOffsetAccountBalanceGroup').show();
	});

	$('#LoanOffsetAccountNo').parent().click(function(){
		$('#LoanOffsetAccountBalanceGroup').hide();
	});
});

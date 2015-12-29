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
		numerator = EffectiveInterest*(Math.pow((1+EffectiveInterest),NumberOfPayments));
		denominator = (Math.pow((1+EffectiveInterest),NumberOfPayments))-1;
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
		if(fieldname === 'LoanAmount' || fieldname === 'LoanOffsetAccountBalance') {
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
	arrDates.push({Date:StartDate});
	var start = moment(StartDate);
	for(payment = 0; payment < NumberOfPayments; payment++) {
		start.add(addObj);
		strDate = start.format('YYYY-MM-DD')
		arrDates.push({Date:strDate});
	}
	return arrDates;
}

function generateFormulas(data,LoanAmount,AnnualInterestRate,RepaymentFrequency,RepaymentAmount,objBreakdown,LoanType,Offset,OffsetBalance) {
	EffectiveInterestRate = getEffectiveInterest(AnnualInterestRate,RepaymentFrequency);
	if(OffsetBalance > LoanAmount) {
		OffsetBalanceCalc = LoanAmount;
	} else {
		OffsetBalanceCalc = OffsetBalance
	}
	
	for(row in data) {
		if(row == 0) {
			
			data[row]['LoanAmount'] = LoanAmount;
			if(Offset == "Yes") {
				initialInterest = (LoanAmount-OffsetBalanceCalc)*EffectiveInterestRate;
				data[row]['Interest'] = initialInterest;
				data[row]['OffsetBalance'] = OffsetBalance;
			} else {
				initialInterest = LoanAmount*EffectiveInterestRate;
				data[row]['Interest'] = initialInterest;
			}
			data[row]['RepaymentAmount'] = RepaymentAmount
			
		} else {
			prevRowLoanAmountFormula = '=B'+row+'+C'+row+'-D'+row;
			data[row]['LoanAmount'] = prevRowLoanAmountFormula;

                        if(Offset == "Yes") {
				thisrow = parseInt(row)+1;
				prevRowInterestFormula = '=(B'+thisrow+'-if(E'+thisrow+'>B'+thisrow+',B'+thisrow+',E'+thisrow+'))*'+EffectiveInterestRate;
                                data[row]['Interest'] = prevRowInterestFormula;
				data[row]['OffsetBalance'] = OffsetBalance
                        } else {
				prevRowInterestFormula = '=B'+(parseInt(row)+1)+'*'+EffectiveInterestRate;
                                data[row]['Interest'] = prevRowInterestFormula;
                        }
			data[row]['RepaymentAmount'] = RepaymentAmount;
		}
	}

	return data;
}

function DisplaySpreadsheet(data,OffsetAccount) {
	var sheet = $('#spreadsheet');

	if(OffsetAccount == "Yes") {
		colHeaders = ['Date','Amount Owed','Interest','Repayments','Offset Account Balance'];
		columns = [
			{
				data:'Date'
			},
			{
				data: 'LoanAmount',
				type: 'numeric',
				format: '$0,0.00'
			},
			{
				data: 'Interest',
				type: 'numeric',
				format: '$0,0.00'
			},
			{
				data: 'RepaymentAmount',
				type: 'numeric',
				format: '$0,0.00'
			},
			{
				data: 'OffsetBalance',
				type: 'numeric',
				format: '$0,0.00'
			}

		]

	} else {
		colHeaders = ['Date','Amount Owed','Interest','Repayments'];
		columns = [
			{
				data:'Date'
			},
			{
				data: 'LoanAmount',
				type: 'numeric',
				format: '$0,0.00'
			},
			{
				data: 'Interest',
				type: 'numeric',
				format: '$0,0.00'
			},
			{
				data: 'RepaymentAmount',
				type: 'numeric',
				format: '$0,0.00'
			}

		]

	}

	var hotsheet = sheet.handsontable({
		data:data,
		colHeaders: true,
		contextMenu: true,
		manualColumnResize: true,
		formulas: true,
		colHeaders: colHeaders,
		columns: columns,
		minSpareRows: 1,
		afterScrollVertically: function(){ 
			$('#spreadsheet').find('.wtHolder').width($('#spreadsheet').find('.wtHider').width()+15);
		}
	});

	return hotsheet;
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
	LoanOffsetAccountBalance = objFields['LoanOffsetAccountBalance'];
	

	NumberOfPayments = getNumberOfPayments(LoanTerm,LoanRepaymentFrequency);
	InitialRepaymentAmount = getRepaymentAmount(LoanAmount,LoanInterestRate,LoanRepaymentFrequency,NumberOfPayments,LoanType);
	PaymentBreakdown = getRepaymentBreakdown(LoanAmount, InitialRepaymentAmount, getEffectiveInterest(LoanInterestRate,LoanRepaymentFrequency));
	arrPaymentDates = getRepaymentDates(LoanRepaymentDate,LoanRepaymentFrequency,NumberOfPayments);
	arrMortgageData = generateFormulas(arrPaymentDates,LoanAmount,LoanInterestRate,LoanRepaymentFrequency,InitialRepaymentAmount,PaymentBreakdown,LoanType,LoanOffsetAccount,LoanOffsetAccountBalance);
	objhot = DisplaySpreadsheet(arrMortgageData,LoanOffsetAccount);

	$(objhot).find('.wtHolder').width($(objhot).find('.wtHolder').width()-60);
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

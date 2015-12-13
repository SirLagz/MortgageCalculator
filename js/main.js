function getEffectiveInterest(AnnualInterestRate,RepaymentFrequency) {
        switch(RepaymentFrequency) {
                case "Monthly":
                        EffectiveInterest = AnnualInterestRate/100/12;
                break;
                case "Fortnightly":
                        EffectiveInterest = AnnualInterestRate/100/26;
                break;
                case "Weekly":
                        EffectiveInterest = AnnualInterestRate/100/52;
                break;

        }
	return EffectiveInterest;
}

function getNumberOfPayments(LoanTerm,RepaymentType) {
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

	return LoanTerm*payments;
}


function getRepaymentAmount(LoanAmount,AnnualInterestRate,RepaymentFrequency,NumberOfPayments) {
	EffectiveInterest = getEffectiveInterest(AnnualInterestRate,RepaymentFrequency);

	numerator = EffectiveInterest*(Math.pow(1+EffectiveInterest,NumberOfPayments));
	denominator = (Math.pow(1+EffectiveInterest,NumberOfPayments))-1

	amount = LoanAmount*numerator/denominator

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
	console.log(InterestPayment);
}

function CalculateMortgage() {
	objFields = getMortgageDetails();

	NumberOfPayments = getNumberOfPayments(objFields['LoanTerm'],objFields['LoanRepaymentFrequency']);

	InitialRepaymentAmount = getRepaymentAmount(objFields['LoanAmount'],objFields['LoanInterestRate'],objFields['LoanRepaymentFrequency'],NumberOfPayments);

	getRepaymentBreakdown(objFields['LoanAmount'], InitialRepaymentAmount, getEffectiveInterest(objFields['LoanInterestRate'],objFields['LoanRepaymentFrequency']));

}

$().ready(function(){
	$('#LoanRepaymentDate').datepicker({
		dateFormat:"yy-mm-dd"
	});

	$('#btnCalculate').click(function(){
		CalculateMortgage();
	});
});

<?php

function getDivisor($RepaymentType) {
	switch($RepaymentType) {
		case "Monthly":
			return 12;
		break;
		case "Fortnightly":
			return 26;
		break;
		case "Weekly":
			return 52;
		break;
	}
}

function getEffectiveInterest($AnnualInterestRate, $RepaymentFrequency) {
	return $AnnualInterestRate/getDivisor($RepaymentFrequency)/100;
}

function getNumberOfPayments($LoanTerm, $RepaymentFrequency) {
	return $LoanTerm*getDivisor($RepaymentFrequency);
}

function getRepaymentAmount($LoanAmount, $AnnualInterestRate, $RepaymentFrequency, $NumberOfPayments, $LoanType) {
	$EffectiveInterest = getEffectiveInterest($AnnualInterestRate, $RepaymentFrequency);
	echo $EffectiveInterest.'<br />';
	if($LoanType === 'PI') {
		$amount = $LoanAmount*$EffectiveInterest/(1-pow((1+$EffectiveInterest),-$NumberOfPayments));
	} else {
		$amount = $LoanAmount*$EffectiveInterest;
	}

	return $amount;
}

function getRepaymentDates($StartDate, $RepaymentFrequency, $NumberOfPayments) {
	switch($RepaymentFrequency) {
		case "Monthly":
			$diPayments = new DateInterval('P1M');
		break;
		case "Fortnightly":
			$diPayments = new DateInterval('P2W');
		break;
		case "Weekly":
			$diPayments = new DateInterval('P1W');
		break;
	}

	$dtStartDate = new DateTime($StartDate);

	$arrDates = [];
	$arrDates[$dtStartDate->format('Y-m-d')] = ["date"=>$dtStartDate->format('Y-m-d')];

	for($date = 0; $date < $NumberOfPayments; $date++) {
		$dtStartDate->add($diPayments);
		$arrDates[$dtStartDate->format('Y-m-d')] = ["date"=>$dtStartDate->format('Y-m-d')];
	}

	return $arrDates;
}

function generateFormulas($data, $LoanAmount, $AnnualInterestRate, $RepaymentFrequency, $RepaymentAmount, $LoanType, $Offset, $OffsetBalance) {
	$EffectiveInterest = getEffectiveInterest($AnnualInterestRate, $RepaymentFrequency);
	if($OffsetBalance > $LoanAmount) {
		$OffsetBalanceCalc = $LoanAmount;
	} else {
		$OffsetBalanceCalc = $OffsetBalance;
	}

	$first = array_shift(array_values($data));
	$count = 1;

	foreach($data as $key=>&$row) {
		if($first['date'] === $key) {
			$row['LoanAmount'] = $LoanAmount;
			$row['RepaymentAmount'] = $RepaymentAmount;
			if($Offset === "Yes") {
				$initialInterest = ($LoanAmount-$OffsetBalanceCalc)*$EffectiveInterest;
				$row['Interest'] = $initialInterest;
				$row['OffsetBalance'] = $OffsetBalance;
			} else {
				$initialInterest = $LoanAmount*$EffectiveInterest;
				$row['Interest'] = $initialInterest;
			}
		} else {
			$currentRow = $count+1;
			$prevRowLoanAmountFormula = '=B'.$count.'+C'.$count.'-D'.$count;
			$row['LoanAmount'] = $prevRowLoanAmountFormula;
			$row['RepaymentAmount'] = $RepaymentAmount;
			if($Offset === "Yes") {
				$prevRowInterestFormula = '=(B'.$currentRow.'-if(E'.$currentRow.'>B'.$currentRow.',B'.$currentRow.',E'.$currentRow.'))*'.$EffectiveInterest;
				$row['Interest'] = $prevRowInterestFormula;
				$row['OffsetBalance'] = $OffsetBalance;
			} else {
				$prevRowInterestFormula = '=B'.$currentRow.'*'.$EffectiveInterest;
				$row['Interest'] = $prevRowInterestFormula;
			}
		}
		$count++;
	}

	return $data;
}

$data = getRepaymentDates('2015-12-12','Fortnightly',360);
$output = generateFormulas($data,350000,4.58,'Monthly',1780,'PI','No',0);

echo json_encode($output);

?>


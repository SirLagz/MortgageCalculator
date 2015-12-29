<?php
if(!isset($_POST['LoanAmount']) || !isset($_POST['InterestRate']) || !isset($_POST['LoanTerm']) || !isset($_POST['LoanType']) || !isset($_POST['RepaymentFrequency']) || !isset($_POST['RepaymentDates']) || !isset($_POST['OffsetAccount'])) {
	$output = ['result'=>'Error','data'=>'Incomplete Form Data'];
	die(json_encode($output));
}

include('generateData.php');

$LoanAmount = $_POST['LoanAmount'];
$InterestRate = $_POST['InterestRate'];
$LoanTerm = $_POST['LoanTerm'];
$LoanType = $_POST['LoanType'];
$RepaymentFrequency = $_POST['RepaymentFrequency'];
$RepaymentDates = $_POST['RepaymentDates'];
$OffsetAccount = $_POST['OffsetAccount'];
$OffsetAccountBalance = @$_POST['OffsetAccountBalance']?$_POST['OffsetAccountBalance']:0;

$NumberOfPayments = getNumberOfPayments($LoanTerm,$RepaymentFrequency);
$RepaymentAmount = getRepaymentAmount($LoanAmount,$InterestRate,$RepaymentFrequency,$NumberOfPayments,$LoanType);

$dates = getRepaymentDates($RepaymentDates, $RepaymentFrequency, $NumberOfPayments);
$arrData = generateFormulas($dates,$LoanAmount,$InterestRate,$RepaymentFrequency,$RepaymentAmount,$LoanType,$OffsetAccount,$OffsetAccountBalance);
echo json_encode($arrData);

?>

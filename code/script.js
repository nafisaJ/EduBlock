/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Add Specialization for student
 * @param {org.acme.education.blockchain.Specialization} specialization - the offer
 * @transaction
 */
function addSpecialization(specialization) {
    var student = specialization.student;
    
    if (student.qualifications.courses == null) {
        student.qualifications.courses = [];
    }
    student.qualifications.courses.push(specialization);
    return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(studentQualificationRegistry) {
            // save the vehicle listing
            return studentQualificationRegistry.update(student);
        });
}

/**
 * Add ExperienceCertificate to an employee
 * @param {org.acme.education.blockchain.ExperienceCertificate} certificate - the offer
 * @transaction
 */
function registerExperience(certificate) {
    var employee = certificate.employee;
    
    if (employee.qualifications.experience == null) {
        employee.qualifications.experience = [];
    }
    employee.qualifications.experience.push(certificate);
    return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(studentQualificationRegistry) {
            // save the vehicle listing
            return studentQualificationRegistry.update(employee);
        });
}

//VerifyEmployee

/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.VerifyEmployee} appliedCandidate - the offer
 * @transaction
 */
function verifyEmployee(appliedCandidate) {
    var employee = appliedCandidate.candidate;
    
    if (employee.appliedTo == null) {
        employee.appliedTo = [];
    }
    employee.appliedTo.push(appliedCandidate.appliedTo);
    return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(studentQualificationRegistry) {
            // save the vehicle listing
      		var verificationNotification = getFactory().newEvent('org.acme.education.blockchain', 'VerificationNotification');
            verificationNotification.candidate = appliedCandidate.candidate;
            emit(verificationNotification);
            return studentQualificationRegistry.update(employee);
        });
}


/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.ConnectTo} connectRequest - the offer
 * @transaction
 */
function ConnectTo(connectRequest) {
    var student = connectRequest.peer;
    
    if (student.pendingRequests == null) {
        student.pendingRequests = [];
    }
    student.pendingRequests.push(connectRequest.userid);
    return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(ConnectToRegistry) {
            // save the vehicle listing
            return ConnectToRegistry.update(student);
        });
}


/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.Approve} approveRequest - the offer
 * @transaction
 */
function Approve(approveRequest) {
    var student = approveRequest.peer;
    var you = approveRequest.userid;
    if (student.peers == null) {
        student.peers = [];
    }
    student.peers.push(you);
  
  	if (you.peers == null) {
        you.peers = [];
    }
    you.peers.push(student);
	
	var newStack=[];
	
	while(you.pendingRequests && you.pendingRequests.length>0){
	var st = you.pendingRequests.pop();
     if (st.getIdentifier()!=student.getIdentifier() )
     {
        newStack.push(st);
        
     }
	}
	
	you.pendingRequests=newStack;
	
    return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(ApproveRegistry) {
            // save the vehicle listing
            return ApproveRegistry.updateAll([student, you]);
        });
}

/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.AddSkills} skillRequest - the offer
 * @transaction
 */
function addSkills(skillRequest) {
  var skill = skillRequest.skill;
  var student = skillRequest.student;
 
  	return getAssetRegistry('org.acme.education.blockchain.Skills')
        .then(function (assetRegistry) {

            // Update the asset in the asset registry.
            return assetRegistry.addAll([skill]);

        }).then(function(){
       	if (student.skills == null) {
        	student.skills = [];
    	}
    	student.skills.push(skill);
  		return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(AddSkillRegistry) {
            // save the vehicle listing
            return AddSkillRegistry.update(student);
        });
    });
}

/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.RequestEndorsement} endorseRequest - the offer
 * @transaction
 */
function RequestEndorsement(endorseRequest) {
    var student = endorseRequest.userId;
    var requestFrom = endorseRequest.requestEndorsementFrom;
  	var skill = endorseRequest.skill;
  
  	var factory = getFactory();
    var NS = 'org.acme.education.blockchain';
  
  	// create the shipper
    var endorseRequest = factory.newResource(NS, 'EndorseRequests', student.email+requestFrom.email+skill.skillID );
  	endorseRequest.requestEndorseFrom = factory.newRelationship(NS, 'Student', student.email);
  	endorseRequest.skillID = factory.newRelationship(NS, 'Skills', skill.skillID);
  
    
    return getAssetRegistry('org.acme.education.blockchain.EndorseRequests')
        .then(function (assetRegistry) {

            // Update the asset in the asset registry.
            return assetRegistry.addAll([endorseRequest]);

        }).then(function(){
       	if (requestFrom.pendingEndorseRequests == null) {
        	requestFrom.pendingEndorseRequests = [];
    	}
    	requestFrom.pendingEndorseRequests.push(endorseRequest);
      
  		return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(EnorseReqlRegistry) {
            // save the vehicle listing
            return EnorseReqlRegistry.update(requestFrom);
        });
    });
}


/**
 * Verify the Qualification provided by the applicant
 * @param {org.acme.education.blockchain.ApproveEndorsement} approveEndorsement - the offer
 * @transaction
 */
 function ApproveEndorsement(approveEndorsement) {
	 var student = approveEndorsement.userId;
	 var approveEndorsementOf = approveEndorsement.approveEndorsementOf;
  	 var skill = approveEndorsement.skill;
	 var comments = approveEndorsement.comments;
	 
	 var factory = getFactory();
	 var NS = 'org.acme.education.blockchain';
	 
	 var reqToBeRemoved = approveEndorsementOf.email+student.email+skill.skillID;
	 
	 var newStack=[];
	
	while(student.pendingEndorseRequests && student.pendingEndorseRequests.length>0){
	var st = student.pendingEndorseRequests.pop();
     if (st.getIdentifier()!= reqToBeRemoved )
     {
        newStack.push(st);
        
     }
	}
	
	student.pendingEndorseRequests=newStack;
	
	var skillsOfStudent = [];
    var endorse = factory.newResource(NS, 'Endorse', reqToBeRemoved );
	endorse.endorser = factory.newRelationship(NS, 'Student', student.email);
	endorse.comments = comments;
    return getAssetRegistry('org.acme.education.blockchain.Endorse')
        .then(function (assetRegistry) {

            // Update the asset in the asset registry.
            return assetRegistry.addAll([endorse]);

        }).then(function(){
      	if (skill.endorsements == null) {
        	skill.endorsements = [];
    	}
      	skill.endorsements.push(endorse);
   		 return getAssetRegistry('org.acme.education.blockchain.Skills')
        .then(function(ApproveEndorseRegistry1) {
            // save the vehicle listing
            return ApproveEndorseRegistry1.update(skill);
        }).then(function(){
   
	while(approveEndorsementOf.skills && approveEndorsementOf.skills.length>0){
	var skillT = approveEndorsementOf.skills.pop();
     if (skillT.getIdentifier()!= skill.getIdentifier() )
     {
       
        skillsOfStudent.push(skillT);
        
     }
	 else{
		 if (skillT.endorsements == null) {
			skillT.endorsements = [];
		 }	 
       		
		 
       	
       
		 skillsOfStudent.push(skill);
         
       		
	 }
	}
	approveEndorsementOf.skills = skillsOfStudent;
	
	return getParticipantRegistry('org.acme.education.blockchain.Student')
        .then(function(ApproveEndorseRegistry) {
            // save the vehicle listing
            return ApproveEndorseRegistry.updateAll([student, approveEndorsementOf]);
        });
	
    });
    });
	 
 }
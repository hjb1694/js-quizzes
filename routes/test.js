const express = require('express');

const router = new express.Router();

const db = require('../util/db');

const loggedInTrue = require('../middleware/loggedInTrue');
const hasPaidTrue = require('../middleware/hasPaidTrue');


// GET /test/

router.get('/', loggedInTrue, hasPaidTrue, async (req,res,next) => {

    let qry = `
    SELECT id, name
    FROM tests 
    `;

    let [rows, fields] = await db.query(qry);

    res.render('allTests',{
        title : 'All Tests', 
        testList : rows
    });


});


// GET /test/:id

router.get('/:id',  loggedInTrue, hasPaidTrue, async (req,res,next)=>{

    let qry = `
    SELECT tests.id, tests.name, tests.description, test_items.question_no, test_items.question, test_items.option_1, test_items.option_2, test_items.option_3, test_items.option_4, test_items.option_5, test_items.correct_answer
    FROM tests JOIN test_items
    ON tests.id = test_items.test_id
    WHERE tests.id = ?
    `;

    let [rows, fields] = await db.execute(qry, [req.params.id]);

    let questions = [];

    for(let item of rows){
        questions.push(
            {
                num : item.question_no,
                content : item.question,
                options : [
                    {choice : 'A', number : 1, choiceContent : item.option_1},
                    {choice : 'B', number : 2, choiceContent : item.option_2},
                    {choice : 'C', number : 3, choiceContent : item.option_3},
                    {choice : 'D', number : 4, choiceContent : item.option_4},
                    {choice : 'E', number : 5, choiceContent : item.option_5}
                ]
            }
        );
    }


    res.render('test',{
        title : 'Test',
        testId : rows[0].id,
        testName : rows[0].name, 
        testDesc : rows[0].description, 
        questions
    });


});

router.post('/', loggedInTrue, hasPaidTrue, async (req,res,next) => {

    let testNo = req.body.testnumber;

    let qry = `
    SELECT tests.id, tests.name, tests.description, test_items.question_no, test_items.question, test_items.option_1, test_items.option_2, test_items.option_3, test_items.option_4, test_items.option_5, test_items.correct_answer
    FROM tests JOIN test_items
    ON tests.id = test_items.test_id
    WHERE tests.id = ?
    `;

    let [rows, fields] = await db.execute(qry, [testNo]); 


    let results = [];
    let scores = {
        correct : 0,
        incorrect : 0
    }


    for(row of rows){

        let result = {
            question : row.question, 
        }

        function getAnswerText(item){

            let itemNo = Number(item);
            let text;
            switch(itemNo){
                case 1:
                    text = row.option_1;
                break;
                case 2:
                    text = row.option_2;
                break;
                case 3:
                    text = row.option_3;
                break;
                case 4:
                    text = row.option_4;
                break;
                case 5: 
                    text = row.option_5;
                break;
            }

            return text;
        }

        result.correctAnswer = getAnswerText(row.correct_answer);
        result.userAnswer = getAnswerText(req.body[row.question_no]);

        if(row.correct_answer != req.body[row.question_no]){
            result.score = 'incorrect';
            scores.incorrect++;
        } else {
            result.score = 'correct';
            scores.correct++;
        }
        

        results.push(result);

    }

    res.render('results',{
        title : 'Test Results',
        results, 
        scores
    });

});


module.exports = router;
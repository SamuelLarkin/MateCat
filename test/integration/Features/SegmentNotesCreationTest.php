<?php

class Features_SegmentNotesCreationTest extends AbstractTest
{


    function testRecordsAreCreatedWithProject()
    {
        $options = array('files' => array(
            test_file_path('small-with-notes.sdlxliff')
        ));

        $body = integrationCreateTestProject($options);

        $this->assertNotNull($body->id_project);
        $this->assertNotNull($body->project_pass);

        // ensure one job is created
        $project = Projects_ProjectDao::findById($body->id_project);

        $jobs = $project->getJobs(); 
        $this->assertEquals(1, count($project->getJobs()));

        $segments = $project->getJobs()[0]->getChunks()[0]->getSegments(); 
        $this->assertEquals( 4, count($segments)); 

        var_dump( $segments[3]->getNotes() );
        $this->assertEquals( 'This is a comment', $segments[0]->getNotes()[0]->note);
        $this->assertEquals( 'This is another comment', $segments[1]->getNotes()[0]->note);
        $this->assertEquals( 0,  count( $segments[2]->getNotes()));
        $this->assertEquals( 0,  count( $segments[3]->getNotes()));

    }

}


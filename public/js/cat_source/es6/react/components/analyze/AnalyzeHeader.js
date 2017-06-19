
let AnalyzeConstants = require('../../constants/AnalyzeConstants');

class AnalyzeHeader extends React.Component {

    constructor(props) {
        super(props);
        this.previousQueueSize = 0;
        this.lastProgressSegments = 0;
        this.noProgressTail = 0;
        this.state = {
        };
    }


    getAnalysisStateHtml() {
        let html = <div className="analysis-create">
            <div className="search-tm-matches">
                <div className="ui active inline loader"/>
                <span className="complete">Fast word counting...</span>
            </div>
        </div>;
        let status = this.props.data.get('STATUS');
        let in_queue_before = this.props.data.get('IN_QUEUE_BEFORE');
        if( status === 'DONE' ) {
             html = <div className="analysis-create">
                <div className="search-tm-matches">
                    <span className="complete">Analysis complete</span>
                    <a className="downloadAnalysisReport" onClick={this.downloadAnalysisReport.bind(this)}>Download Analysis Report</a>
                </div>
            </div>;

        } else if ( (status === 'NEW') || (status === '') || in_queue_before > 0 ) {
            if ( config.daemon_warning ) {
                let analyzerNotRunningErrorString;
                if ( config.support_mail.indexOf( '@' ) === -1 ) {
                    analyzerNotRunningErrorString = <p className="label">The analysis seems not to be running. Contact {config.support_mail}.</p>;
                } else {
                    analyzerNotRunningErrorString = <p className="label">The analysis seems not to be running. Contact <a href={"mailto: " + config.support_mail}>{config.support_mail}</a>.</p>;
                }
                html = <div className="analysis-create">
                    <div className="search-tm-matches">
                        <span className="complete">{analyzerNotRunningErrorString}</span>
                    </div>
                </div>;
            } else if ( in_queue_before > 0 ) {
                if ( this.previousQueueSize <= in_queue_before ) {
                    html = <div className="analysis-create">
                        <div className="search-tm-matches">
                            <span className="complete"><p className="label">There are other projects in queue. Please wait...</p></span>
                        </div>
                    </div>
                } else { //decreasing ( TM analysis on another project )
                    html = <div className="analysis-create">
                        <div className="search-tm-matches">
                            <span className="complete">
                                <p className="label">There are still <span className="number">{this.props.data.get('IN_QUEUE_BEFORE_PRINT') }</span> segments in queue. Please wait...</p>
                            </span>
                        </div>
                    </div>
                }
            }
            this.previousQueueSize = in_queue_before;

        } else if ( status === 'FAST_OK' && in_queue_before === 0 ) {

            if ( this.lastProgressSegments !== this.props.data.get('SEGMENTS_ANALYZED') ) {

                this.lastProgressSegments = this.props.data.get('SEGMENTS_ANALYZED');
                this.noProgressTail = 0;

                html =  this.getProgressBar();

            } else {

                this.noProgressTail++;
                if ( this.noProgressTail > 9 ) {
                    if ( config.support_mail.indexOf( '@' ) === -1 ) {
                        analyzerNotRunningErrorString = 'The analysis seems not to be running. Contact ' + config.support_mail + '.';
                    } else {
                        analyzerNotRunningErrorString = 'The analysis seems not to be running. Contact <a href="mailto:' + config.support_mail + '">' + config.support_mail + '</a>.';
                    }
                    html = <div className="analysis-create">
                        <div className="search-tm-matches">
                            <span className="complete">{analyzerNotRunningErrorString}</span>
                        </div>
                    </div>
                }

            }

        }  else if( status === 'NOT_TO_ANALYZE' ){
            html = <div className="analysis-create">
                <div className="search-tm-matches">
                    <span className="complete">This job is too big.</span>
                    <span className="analysisNotPerformed">The analysis was not performed.</span>
                </div>
            </div>

        } else {

            html =  <div className="analysis-create">
                <div className="search-tm-matches">
                    <h5>Searching for TM Matches </h5>
                    <div className="initial-segments"> (71 of </div>
                    <div className="total-segments">2393)</div>
                    <div className="progress-bar">
                        <div className="progr">
                            <div className="meter">
                                <a className="approved-bar translate-tooltip"  data-html="Approved 100%" style={{width: "60%"}}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
        }
        return html;
    }

    getProgressBar() {
        let width = ((this.props.data.get('SEGMENTS_ANALYZED') / this.props.data.get('TOTAL_SEGMENTS')) * 100) + '%';
        return  <div className="analysis-create">
                    <div className="search-tm-matches">
                        <h5>Searching for TM Matches </h5>
                        <span className="initial-segments"> ({this.props.data.get('SEGMENTS_ANALYZED_PRINT')} of </span>
                        <span className="total-segments"> {" " + this.props.data.get('TOTAL_SEGMENTS_PRINT')})</span>
                        <div className="progress-bar">
                            <div className="progr">
                                <div className="meter">
                                    <a className="approved-bar translate-tooltip"  data-html={'Approved ' + width}  style={{width: width}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>;
    }

    getWordscount() {
        let status = this.props.data.get('STATUS');
        let raw_words_text = this.props.data.get('TOTAL_RAW_WC_PRINT'), weightedWords_text = '';
        let raw_words = this.props.data.get('TOTAL_RAW_WC'), weightedWords = '';
        if ( ((status === 'NEW') || (status === '') || this.props.data.get('IN_QUEUE_BEFORE') > 0) && config.daemon_warning ) {
            weightedWords_text = this.props.data.get('TOTAL_RAW_WC_PRINT');
            weightedWords = this.props.data.get('TOTAL_RAW_WC');
        } else {
            if ( status === 'DONE' || this.props.data.get('TOTAL_PAYABLE') > 0 ) {
                weightedWords_text = this.props.data.get('TOTAL_PAYABLE_PRINT');
                weightedWords = this.props.data.get('TOTAL_PAYABLE');
            }
            if( status === 'NOT_TO_ANALYZE' ) {
                weightedWords_text = this.props.data.get('TOTAL_RAW_WC_PRINT');
                weightedWords = this.props.data.get('TOTAL_RAW_WC');
            }
        }
        let saving_perc = parseInt((raw_words - weightedWords)/raw_words * 100) + "%";
        if (saving_perc !== this.saving_perc_value) {
            this.updatedSavingWords = true;
        }
        this.saving_perc_value = saving_perc;

        if (weightedWords !== this.weightedWords) {
            this.updatedWeightedWords = true;
        }
        this.weightedWords = weightedWords;
        return <div className="word-count ui grid">
                <div className="sixteen wide column">
                    <div className="word-percent " ref={(container) => this.containerSavingWords = container}>
                        <h2 className="ui header">
                            <div className="percent">{saving_perc}</div>
                            <div className="content">
                                Saving on word count
                                <div className="sub header">{this.props.data.get('PAYABLE_WC_TIME')} work {this.props.data.get('PAYABLE_WC_UNIT')} at 3.000 w/day
                                </div>
                            </div>
                        </h2>
                        <p>MateCat gives you more matches than any other CAT tool thanks to a mix of public and private translation memories, and machine translation.
                        </p>
                    </div>
                </div>
                <div className="sixteen wide column pad-top-0">
                    <div className="raw-matecat ui grid">
                        <div className="eight wide column pad-right-7">
                            <div className="word-raw">
                                <h3>{raw_words_text}</h3>
                                <h4>Raw words</h4>
                            </div>
                            <div className="overlay"/>
                        </div>
                        <div className="eight wide column pad-left-7">
                            <div className="matecat-raw " ref={(container) => this.containerWeightedWords = container}>
                                <h3>{weightedWords_text}</h3>
                                <h4>MateCat weighted words</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


    }

    getDate() {
        let date = this.props.project.get('create_date').substr(0,10);
        return new Date(date).toDateString();
    }

    downloadAnalysisReport() {
        UI.downloadAnalysisReport();
    }

    componentDidUpdate() {
        let self = this;
        if (this.updatedSavingWords) {
            this.containerSavingWords.classList.add('updated-count');
            this.updatedSavingWords = false;
            setTimeout(function () {
                self.containerSavingWords.classList.remove('updated-count');
            }, 400)
        }
        if (this.updatedWeightedWords) {
            this.containerWeightedWords.classList.add('updated-count');
            this.updatedSavingWords = false;
            setTimeout(function () {
                self.containerWeightedWords.classList.remove('updated-count');
            }, 400)
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    render() {
        let analysisStateHtml = this.getAnalysisStateHtml();
        let wordsCountHtml = this.getWordscount();
        return <div className="project-header ui grid">
                    <div className="left-analysis nine wide column">
                        <h1>Volume Analysis</h1>
                        <div className="ui ribbon label">
                            <div className="project-id" title="Project id"> ({this.props.project.get('id')}) </div>
                            <div className="project-name" title="Project name"> {this.props.project.get('name')} </div>
                        </div>
                        <div className="project-create">Created on {this.getDate()}</div>
                        {analysisStateHtml}
                    </div>

                    <div className="seven wide right floated column">
                        {wordsCountHtml}
                    </div>
            </div>;


    }
}

export default AnalyzeHeader;

class SegmentFixedButton extends React.Component{

    handleClick() {
        if ( !this.props.disabled ) {
            window.ReviewImproved.clickOnFixed(this.props.sid);
        }
    }

    render() {

        var fixedButton = <li>
                <a className="button button-fixed status-fixed"
                   onClick={this.handleClick}
                   href="javascript:;"
                   disabled={this.props.disabled} >
                    FIXED
                </a>
                <p>{window.UI.shortcutLeader}+ENTER</p>
            </li>
        ;

        return fixedButton ;
    }
}

export default SegmentFixedButton ;

declare module "alertifyjs" {
  /**
   * Create an alert dialog box
   * @param title     The title of alert modal
   * @param message   The message passed from the callee
   * @param fn        Callback function
   * @param cssClass  Class(es) to append to dialog box
   * @return alertifyjs (ie this)
   * @since 0.0.1
   */
  function alert(
    title: string,
    message: string,
    fn?: Function,
    cssClass?: string
  ): alertifyjs;
  /**
   * Shorthand for log messages
   * @param message The message passed from the callee
   * @return alertifyjs (ie this)
   * @since 0.0.1
   */
  function success(message: string): alertifyjs;

  /**
   * Shorthand for log messages
   * @param message The message passed from the callee
   * @return alertifyjs (ie this)
   * @since 0.0.1
   */
  function error(message: string): alertifyjs;

  function warning(message: string);

  /**
   * Create a confirm dialog box
   * @title {String or DOMElement} The dialog title.
   * @message {String or DOMElement} The dialog contents.
   * @onok {Function} Invoked when the user clicks OK button.
   * @oncancel {Function} Invoked when the user clicks Cancel button or closes the dialog.
   * @return alertifyjs (ie this)
   * @since 0.0.1
   */
  function confirm(message: string, onok?: Function): alertifyjs;

  /**
   * Create a confirm dialog box
   * @title {String or DOMElement} The dialog title.
   * @message {String or DOMElement} The dialog contents.
   * @onok {Function} Invoked when the user clicks OK button.
   * @oncancel {Function} Invoked when the user clicks Cancel button or closes the dialog.
   * @return alertifyjs (ie this)
   * @since 0.0.1
   */
  function confirm(
    title: String,
    message: string,
    onok?: Function,
    oncancel?: Function
  ): alertifyjs;

  /**
   * Dismisses all open notifications
   *
   * @return {undefined}
   */
  function dismissAll(): void;
  /**
   * Sets dialog settings/options
   */
  function set(name: string, key: string, value: string): any;

  /**
   * Gets dialog settings/options
   */
  function get(name: string, key: string): any;
}

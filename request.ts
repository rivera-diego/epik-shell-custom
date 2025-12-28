// Request handler for external commands
// Currently not in use - can be extended later with custom commands
// Example: ags request <command>

export default function requestHandler(
  request: string,
  res: (response: any) => void,
): void {
  switch (request) {
    // Add your custom commands here
    // case "my-command":
    //   res("ok");
    //   // Your code here
    //   break;

    default:
      res("not ok");
      break;
  }
}

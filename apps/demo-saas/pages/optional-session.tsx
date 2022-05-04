import { GetServerSideProps } from 'next'
import { getSession } from '@frontegg/nextjs';
import { useAuthUserOrNull } from '@frontegg/react-hooks';

export default function OptionalSession({ ssrSession }) {
  const user = useAuthUserOrNull();
  return <div>
    <h1>Optional Server-Side session</h1>

    <br/>
    hook: {user && JSON.stringify(user)}
    <br/>
    SSR Session: {ssrSession ? JSON.stringify(ssrSession) : 'No Session'}

  </div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context.req);
  if (session) {
    return { props: { ssrSession: session } }
  }

  return {
    props: {},
  };

}

